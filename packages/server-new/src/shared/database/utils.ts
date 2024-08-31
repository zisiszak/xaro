import { database } from '~/index.js';
import {
	type AnyTable,
	type IdentifiableTableName,
	type NonIdentifiableTableName,
	type TableInsertion,
	type TableSchema,
	type TableSelection,
	identifiableTableNames,
} from '~/modules/database.schema.js';

export const formatSQLiteList = <V extends string | number>(
	input: Array<V> | ReadonlyArray<V>,
): string => {
	const result = `${input.map((v) => (typeof v === 'number' ? v : `'${v}'`)).join(',')}`;
	console.log(result);
	return result;
};

/** Ensures a reference to a foreign table ID column is valid within the database schema. Only useful for modifying/creating table schemas really. */
export const referenceForeignTableID = <Table extends IdentifiableTableName>(
	tableName: Table,
): `${Table}.id` => `${tableName}.id`;

export const findByID = async <Table extends IdentifiableTableName>(
	table: Table,
	id: number,
): Promise<TableSelection<Table> | undefined> =>
	database
		.selectFrom(table)
		.selectAll()
		.where('id', '=', id as any)
		.executeTakeFirst() as Promise<TableSelection<Table> | undefined>;

export const checkExistsByID = async <Table extends IdentifiableTableName>(
	table: Table,
	id: number,
): Promise<boolean> =>
	database
		.selectFrom(table)
		.select('id')
		.where('id', '=', id as any)
		.executeTakeFirst()
		.then(Boolean);

export const findByColumn = async <
	Table extends AnyTable,
	Column extends keyof TableSchema<Table> & string,
>(
	table: Table,
	column: Column,
	value: Column extends keyof TableSelection<Table> ? TableSelection<Table>[Column] : never,
): Promise<TableSelection<Table> | undefined> =>
	database
		.selectFrom(table)
		.selectAll()
		.where(column, '=', value as any)
		.executeTakeFirst() as Promise<TableSelection<Table> | undefined>;

export const findAllByColumn = async <
	Table extends AnyTable,
	Column extends keyof TableSchema<Table> & string,
>(
	table: Table,
	column: Column,
	value: Column extends keyof TableSelection<Table> ? TableSelection<Table>[Column] : never,
): Promise<TableSelection<Table>[]> =>
	database
		.selectFrom(table)
		.selectAll()
		.where(column, '=', value as any)
		.execute() as unknown as Promise<TableSelection<Table>[]>;

export const checkExistsByColumn = async <
	Table extends AnyTable,
	Column extends keyof TableSchema<Table> & string,
>(
	table: Table,
	column: Column,
	value: Column extends keyof TableSelection<Table> ? TableSelection<Table>[Column] : never,
): Promise<boolean> =>
	database
		.selectFrom(table)
		.select(column)
		.where(column, '=', value as any)
		.executeTakeFirst()
		.then(Boolean);

/** On conflict throws */
export const insertRow = async <Table extends AnyTable>(
	table: Table,
	insertion: TableInsertion<Table>,
): Promise<Table extends IdentifiableTableName ? number : undefined> =>
	database
		.insertInto(table)
		.values(insertion)
		.executeTakeFirst()
		.then(
			(result) =>
				(typeof result.insertId === 'undefined'
					? undefined
					: Number(result.insertId)) as Table extends IdentifiableTableName
					? number
					: undefined,
		);

async function _insert<Table extends NonIdentifiableTableName>(
	table: Table,
	valueOrValues: TableInsertion<Table>[] | TableInsertion<Table>,
): Promise<undefined>;
async function _insert<Table extends IdentifiableTableName>(
	table: Table,
	value: TableInsertion<Table>,
): Promise<number>;
async function _insert<Table extends IdentifiableTableName>(
	table: Table,
	values: TableInsertion<Table>[],
): Promise<number[]>;
async function _insert<Table extends IdentifiableTableName>(
	table: Table,
	valueOrValues: TableInsertion<Table>[] | TableInsertion<Table>,
): Promise<number[] | number>;
async function _insert<Table extends AnyTable>(
	table: Table,
	insertionOrInsertions: TableInsertion<Table>[] | TableInsertion<Table>,
) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const withIdColumn = identifiableTableNames.has(table as any);
	const many = Array.isArray(insertionOrInsertions);

	const query = database.insertInto(table).values(insertionOrInsertions);

	if (many) {
		if (withIdColumn)
			return query
				.returning('id as id' as any)
				.execute()
				.then((result) => (result as { id: number }[]).map(({ id }) => id));

		return query.execute().then(() => undefined);
	}

	if (withIdColumn)
		return query
			.returning('id as id' as any)
			.executeTakeFirstOrThrow()
			.then((result) => (result as { id: number }).id);

	return query.executeTakeFirst().then(() => undefined);
}

export const insert = _insert;

export const insertRowOnConflictDoNothing = async <Table extends AnyTable>(
	table: Table,
	insertion: TableInsertion<Table>,
): Promise<Table extends IdentifiableTableName ? number | undefined : undefined> =>
	database
		.insertInto(table)
		.values(insertion)
		.onConflict((cb) => cb.doNothing())
		.executeTakeFirst()
		.then(
			(result) =>
				(typeof result.insertId === 'undefined'
					? undefined
					: Number(result.insertId)) as Table extends IdentifiableTableName
					? number | undefined
					: undefined,
		);
