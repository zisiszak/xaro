import { type JSONColumnType } from 'kysely';
import { type DatabaseTable, type TableProtocol, compileTableSchemaQuery } from '~/shared/index.js';
import { type CreatorAliases } from '../models/index.js';

export interface CreatorTableSchema
	extends TableProtocol.AutoDateAdded,
		TableProtocol.Identifiable {
	name: string;
	displayName: string;
	aliases: JSONColumnType<CreatorAliases, string | undefined>;
}

export const CreatorTable: DatabaseTable<'Creator'> = {
	name: 'Creator',
	compiledCreateTableQuery: compileTableSchemaQuery<CreatorTableSchema>(
		'Creator',
		['Identifiable', 'AutoDateAdded'],
		null,
		['name', 'text', (cb) => cb.notNull().unique()],
		['displayName', 'text', (cb) => cb.notNull()],
		['aliases', 'json', (cb) => cb.defaultTo('[]').notNull()],
	),
};
