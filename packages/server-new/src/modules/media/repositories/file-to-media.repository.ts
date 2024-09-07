import { database } from '~/index.js';
import { type TableSelection } from '~/modules/database.schema.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { type FileToMediaLabel, type FileToMediaRelationship } from '../models/index.js';
import { FileToMediaTable } from '../tables/file-to-media.table.js';

export interface FileToMediaRepository {
	/**
	 * Inserts a new row, linking the provided `originalFileID` and `mediaID`.
	 * If there is an existing link, no changes are made.
	 */
	save: (
		originalFileID: number,
		mediaID: number,
		relationship: FileToMediaRelationship,
		label?: FileToMediaLabel | null,
	) => Promise<undefined>;

	/**
	 * Removes the row linking the provided `originalFileID` and `mediaID`, if it exists.
	 */
	remove: (originalFileID: number, mediaID: number) => Promise<void>;

	find: (
		originalFileID: number,
		mediaID: number,
		relationship: FileToMediaRelationship,
		label: FileToMediaLabel | null,
	) => Promise<TableSelection<'FileToMedia'> | undefined>;

	findAll: (
		originalFileID: number,
		mediaID: number,
		relationship?: FileToMediaRelationship | FileToMediaRelationship[],
	) => Promise<TableSelection<'FileToMedia'>[] | undefined>;
}

const TABLE = FileToMediaTable.name;

export const fileToMediaRepository: FileToMediaRepository = {
	save: async (originalFileID, mediaID, relationship, label = null) =>
		insertRowOnConflictDoNothing(TABLE, { originalFileID, mediaID, relationship, label }),
	remove: async (originalFileID, mediaID) => {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ originalFileID, mediaID }))
			.limit(1)
			.executeTakeFirst();
	},
	find: async (originalFileID, mediaID, relationship, label) =>
		database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ originalFileID, mediaID, relationship, label }))
			.limit(1)
			.executeTakeFirst(),
	findAll: async (originalFileID, mediaID, relationship) => {
		let q = database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ originalFileID, mediaID }));

		if (typeof relationship === 'number') q = q.where('relationship', '=', relationship);
		else if (Array.isArray(relationship)) q = q.where('relationship', 'in', relationship);

		return q.execute();
	},
};
