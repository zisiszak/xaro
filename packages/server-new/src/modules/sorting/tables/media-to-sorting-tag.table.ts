import { sql } from 'kysely';
import {
	type DatabaseTable,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface MediaToSortingTagTableSchema {
	mediaID: number;
	sortingTagID: number;
}

export const MediaToSortingTagTable: DatabaseTable<'MediaToSortingTag'> = {
	name: 'MediaToSortingTag',
	compiledCreateTableQuery: compileTableSchemaQuery<MediaToSortingTagTableSchema>(
		'MediaToSortingTag',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(mediaID, sortingTagID)`,
		},
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
		[
			'sortingTagID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('SortingTag'))
					.onDelete('cascade')
					.onUpdate('cascade'),
		],
	),
};
