import { compileTableSchemaQuery, type DatabaseTable, type TableProtocol } from '~/shared/index.js';

export interface PlatformTableSchema
	extends TableProtocol.Identifiable,
		TableProtocol.AutoDateAdded {
	name: string;
	displayName: string;
	homeUrl: string;
	description: string | null;
}

export const PlatformTable: DatabaseTable<'Platform'> = {
	name: 'Platform',
	compiledCreateTableQuery: compileTableSchemaQuery<PlatformTableSchema>(
		'Platform',
		['AutoDateAdded', 'Identifiable'],
		null,
		['name', 'text', (cb) => cb.notNull().unique()],
		['homeUrl', 'text', (cb) => cb.notNull()],
		['displayName', 'text', (cb) => cb.notNull()],
		['description', 'text'],
	),
};
