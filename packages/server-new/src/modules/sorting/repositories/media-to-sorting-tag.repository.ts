import { database } from '~/index.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { type MediaToSortingTagRecord } from '../models/index.js';
import { MediaToSortingTagTable } from '../tables/media-to-sorting-tag.table.js';

export interface MediaToSortingTagRepository {
	/**
	 * Inserts a new row, linking the provided `mediaID` and `sortingTagID`.
	 * If there is an existing link, no changes are made.
	 */
	save(mediaID: number, sortingTagID: number): Promise<void>;

	/**
	 * Removes the row linking the provided `mediaID` and `sortingTagID`, if it exists.
	 */
	remove(mediaID: number, sortingTagID: number): Promise<void>;

	exists(mediaID: number, sortingTagID: number): Promise<boolean>;

	find(mediaID: number, sortingTagID: number): Promise<MediaToSortingTagRecord | undefined>;
}

const TABLE = MediaToSortingTagTable.name;

export const mediaToSortingTagRepository: MediaToSortingTagRepository = {
	async save(mediaID, sortingTagID) {
		return insertRowOnConflictDoNothing(TABLE, { mediaID, sortingTagID });
	},
	async remove(mediaID, sortingTagID) {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ sortingTagID, mediaID }))
			.limit(1)
			.executeTakeFirst();
	},
	async exists(mediaID, sortingTagID) {
		return database
			.selectFrom(TABLE)
			.select('mediaID')
			.where((eb) => eb.and({ sortingTagID, mediaID }))
			.limit(1)
			.executeTakeFirst()
			.then(Boolean);
	},
	async find(mediaID, sortingTagID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ sortingTagID, mediaID }))
			.limit(1)
			.executeTakeFirst();
	},
};
