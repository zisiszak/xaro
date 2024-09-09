import { type JSONColumnType } from 'kysely';
import { type DatabaseTable, type TableProtocol, compileTableSchemaQuery } from '~/shared/index.js';
import { type FileExtension, type FileFormatCategory } from './model.js';

export interface FileFormatTableSchema extends TableProtocol.Identifiable {
	displayName: string;
	shortName: string;
	description: string | null;
	category: FileFormatCategory;
	extensions: JSONColumnType<FileExtension[]>;
}

export const FileFormatTable: DatabaseTable<'FileFormat'> = {
	name: 'FileFormat',
	compiledCreateTableQuery: compileTableSchemaQuery<FileFormatTableSchema>(
		'FileFormat',
		['Identifiable'],
		null,
		['displayName', 'text', (cb) => cb.notNull().unique()],
		['shortName', 'text', (cb) => cb.unique().notNull()],
		['description', 'text'],
		['category', 'integer', (cb) => cb.notNull()],
		['extensions', 'json', (cb) => cb.notNull()],
	),
};
