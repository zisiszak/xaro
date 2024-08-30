import { type ColumnDefinitionBuilder, type CompiledQuery, type RawBuilder } from 'kysely';
import { type ColumnDefinition } from '../index.js';
import { dummySchema } from './dummy-database.js';
import {
	autoDateAdded,
	identifiable,
	trashable,
	type MatchingTableProtocolName,
	type TableProtocolName,
	type TableProtocolSchema,
	type TableProtocolSchemaColumnDefinition,
} from './table-protocols/index.js';

type TableProtocolSchemaOrder = TableProtocolSchema<TableProtocolName>[];

const tableProtocolStartOrderSchemas = [identifiable] as TableProtocolSchemaOrder;
const tableProtocolEndOrderSchemas = [autoDateAdded, trashable] as TableProtocolSchemaOrder;

export const compileTableSchemaQuery = <TableSchema>(
	table: string,
	protocols: MatchingTableProtocolName<TableSchema>[] | null,
	options: {
		modifyEnd?: RawBuilder<unknown>;
		modifyLastColumnEnd?: RawBuilder<unknown>;
		/** @default true */
		ifNotExists?: boolean;
	} | null = null,
	...columns: readonly ColumnDefinition<keyof TableSchema & string>[]
): CompiledQuery<unknown> => {
	const { ifNotExists = true, modifyLastColumnEnd, modifyEnd } = options ?? {};

	let q = dummySchema.createTable(table);
	if (ifNotExists) q = q.ifNotExists();

	const protocolNames = protocols ?? [];

	const protocolStartSchemas = mapProtocolNameOrderToBuilderOrder(
		protocolNames,
		tableProtocolStartOrderSchemas,
	);
	const protocolEndSchemas = mapProtocolNameOrderToBuilderOrder(
		protocolNames,
		tableProtocolEndOrderSchemas,
	);

	const protocolStartColumns: TableProtocolSchemaColumnDefinition<
		MatchingTableProtocolName<TableSchema>
	>[] = protocolStartSchemas.flatMap((schema) => schema.columns);
	const protocolEndColumns: TableProtocolSchemaColumnDefinition<
		MatchingTableProtocolName<TableSchema>
	>[] = protocolEndSchemas.flatMap((schema) => schema.columns);

	const protocolColumnNames = new Set<string>([
		...protocolStartColumns.map((col) => col[0]),
		...protocolEndColumns.map((col) => col[0]),
	]);

	let restrictedColumnNameUsed: string;
	if (
		columns.some(([columnName]) => {
			if (protocolColumnNames.has(columnName)) {
				restrictedColumnNameUsed = columnName;
				return true;
			}
			return false;
		})
	)
		throw `Use of column name "${restrictedColumnNameUsed!}" is restricted by a protocol in use.`;

	const allColumns = [...protocolStartColumns, ...columns, ...protocolEndColumns];

	allColumns.forEach(([column, dataType, cb], i) => {
		if (modifyLastColumnEnd && allColumns.length - 1 === i)
			q = q.addColumn(
				column,
				dataType,
				typeof cb === 'function'
					? (cb2: ColumnDefinitionBuilder) => cb(cb2).modifyEnd(modifyLastColumnEnd)
					: (cb2: ColumnDefinitionBuilder) => cb2.modifyEnd(modifyLastColumnEnd),
			);
		else q = q.addColumn(column, dataType, cb);
	});

	if (modifyEnd) q = q.modifyEnd(modifyEnd);

	return q.compile();
};

function mapProtocolNameOrderToBuilderOrder(
	protocolNames: TableProtocolName[],
	schemaOrder: TableProtocolSchemaOrder,
): TableProtocolSchemaOrder {
	const result: TableProtocolSchemaOrder = [];
	schemaOrder.forEach((protocolSchema) => {
		if (protocolNames.includes(protocolSchema.name)) {
			result.push(protocolSchema);
		}
	});
	return result;
}
