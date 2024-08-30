import { compileTableSchemaQuery, type DatabaseTable, type TableProtocol } from '~/shared/index.js';

export interface SortingTagTableSchema extends TableProtocol.Identifiable {
	name: string;
	description: string | null;
}

export const SortingTagTable: DatabaseTable<'SortingTag'> = {
	name: 'SortingTag',
	compiledCreateTableQuery: compileTableSchemaQuery<SortingTagTableSchema>(
		'SortingTag',
		['Identifiable'],
		null,
		['name', 'text', (cb) => cb.notNull().unique()],
		['description', 'text'],
	),
};
