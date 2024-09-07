import { type JSONColumnType, sql } from 'kysely';
import {
	type DatabaseTable,
	type TableProtocol,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';
import { type FileMetadata } from '../models/index.js';

/** A reference to any file in the filesystem */
export interface FileTableSchema
	extends TableProtocol.AutoDateAdded,
		TableProtocol.Identifiable,
		TableProtocol.Trashable {
	originalFileID: number | null;
	generatedFromFileID: number | null;
	kind: 'original' | 'optimised';
	label: string | null;
	libraryPath: string | null;
	formatID: number;
	size: number;
	fileHash: string;
	dataHash: string | null;
	metadata: JSONColumnType<FileMetadata, string | undefined>;
}

export const FileTable: DatabaseTable<'File'> = {
	name: 'File',
	compiledCreateTableQuery: compileTableSchemaQuery<FileTableSchema>(
		'File',
		['Identifiable', 'AutoDateAdded', 'Trashable'],
		{
			modifyLastColumnEnd: sql`,
		UNIQUE(fileHash, size, formatID),
		CHECK(kind IN ('original', 'optimised')),
		UNIQUE(originalFileID, label, generatedFromFileID),
		CHECK(
			(kind = 'original' AND originalFileID IS NULL) OR
			(kind = 'optimised' AND originalFileID IS NOT NULL)
		)`,
		},
		[
			'formatID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('FileFormat'))
					.onUpdate('cascade')
					.onDelete('restrict'),
		],
		['kind', 'text', (cb) => cb.notNull()],
		['label', 'text'],
		[
			'originalFileID',
			'integer',
			(cb) =>
				cb
					.references(referenceForeignTableID('File'))
					.onDelete('restrict')
					.onUpdate('restrict'),
		],
		[
			'generatedFromFileID',
			'integer',
			(cb) =>
				cb
					.references(referenceForeignTableID('File'))
					.onDelete('restrict')
					.onUpdate('restrict'),
		],
		['libraryPath', 'text', (cb) => cb.unique()],
		['size', 'integer', (cb) => cb.notNull()],
		['fileHash', 'text', (cb) => cb.notNull()],
		['dataHash', 'text', (cb) => cb.unique()],
		['metadata', 'json', (cb) => cb.notNull().defaultTo('{}')],
	),
};
