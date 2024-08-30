import { sql } from 'kysely';
import { type OriginalFileToMediaRelationship } from '~/modules/files/index.js';
import {
	compileTableSchemaQuery,
	type DatabaseTable,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface FileToMediaTableSchema {
	fileID: number;
	mediaID: number;
	relationship: OriginalFileToMediaRelationship;
}

export const FileToMediaTable: DatabaseTable<'FileToMedia'> = {
	name: 'FileToMedia',
	compiledCreateTableQuery: compileTableSchemaQuery<FileToMediaTableSchema>(
		'FileToMedia',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(fileID, mediaID)`,
		},
		[
			'fileID',
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
