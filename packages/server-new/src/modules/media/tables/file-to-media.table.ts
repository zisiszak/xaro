import { sql } from 'kysely';
import {
	compileTableSchemaQuery,
	type DatabaseTable,
	referenceForeignTableID,
} from '~/shared/index.js';
import { type FileToMediaRelationship } from '../models/index.js';

export interface FileToMediaTableSchema {
	originalFileID: number;
	mediaID: number;
	relationship: FileToMediaRelationship;
}

export const FileToMediaTable: DatabaseTable<'FileToMedia'> = {
	name: 'FileToMedia',
	compiledCreateTableQuery: compileTableSchemaQuery<FileToMediaTableSchema>(
		'FileToMedia',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(originalFileID, mediaID)`,
		},
		[
			'originalFileID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('File'))
					.onDelete('cascade')
					.onUpdate('cascade'),
		],
		[
			'mediaID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('Media'))
					.onDelete('cascade')
					.onUpdate('cascade'),
		],
		['relationship', 'integer', (cb) => cb.notNull()],
	),
};
