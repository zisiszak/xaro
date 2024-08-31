import { database } from '~/index.js';
import {
	insertRowOnConflictDoNothing,
	singleDeletionResultAsNullOrUndefined,
} from '~/shared/index.js';
import { type FileToMediaRecord, type FileToMediaRelationship } from '../models/index.js';
import { FileToMediaTable } from '../tables/file-to-media.table.js';

export interface FileToMediaRepository {
	/**
	 * Inserts a new row, linking the provided `originalFileID` and `mediaID`.
	 * If there is an existing link, no changes are made.
	 *
	 * @returns `undefined` on the creation of a new link.
	 * @returns `null` if the link already exists (no change).
	 */
	save(
		originalFileID: number,
		mediaID: number,
		relationship: FileToMediaRelationship,
	): Promise<undefined | null>;

	/**
	 * Removes the row linking the provided `originalFileID` and `mediaID`, if it exists.
	 *
	 * @returns `undefined` on deletion of the matching row.
	 * @returns `null` when no matching row is found (no change).
	 */
	remove(originalFileID: number, mediaID: number): Promise<undefined | null>;

	find(originalFileID: number, mediaID: number): Promise<FileToMediaRecord | undefined>;
}

const TABLE = FileToMediaTable.name;

export const fileToMediaRepository: FileToMediaRepository = {
	async save(originalFileID, mediaID, relationship) {
		const existing = await this.find(originalFileID, mediaID).then(Boolean);
		if (existing) return null;

		return insertRowOnConflictDoNothing(TABLE, { originalFileID, mediaID, relationship });
	},
	async remove(originalFileID, mediaID) {
		return database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ originalFileID, mediaID }))
			.executeTakeFirst()
			.then(singleDeletionResultAsNullOrUndefined);
	},
	async find(originalFileID, mediaID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ originalFileID, mediaID }))
			.limit(1)
			.executeTakeFirst();
	},
};
