import { database } from '~/index.js';
import {
	insertRowOnConflictDoNothing,
	singleDeletionResultAsNullOrUndefined,
} from '~/shared/index.js';
import { type UserToMediaRecord } from '../models/index.js';
import { UserToMediaTable } from '../tables/user-to-media.table.js';

const TABLE = UserToMediaTable.name;

export interface UserToMediaRepository {
	/**
	 * Inserts a new row, linking the provided `userID` and `mediaID`.
	 * If there is an existing link, no changes are made.
	 *
	 * @returns `undefined` on the creation of a new link.
	 * @returns `null` if the link already exists (no change).
	 */
	save(userID: number, mediaID: number): Promise<undefined | null>;

	/**
	 * Removes the row linking the provided `userID` and `mediaID`, if it exists.
	 *
	 * @returns `undefined` on deletion of the matching row.
	 * @returns `null` when no matching row is found (no change).
	 */
	remove(userID: number, mediaID: number): Promise<undefined | null>;

	find(userID: number, mediaID: number): Promise<UserToMediaRecord | undefined>;
}

export const userToMediaRepository: UserToMediaRepository = {
	async save(userID, mediaID) {
		const existing = await this.find(userID, mediaID).then(Boolean);
		if (existing) return null;

		return insertRowOnConflictDoNothing(TABLE, { userID, mediaID });
	},
	async remove(userID, mediaID) {
		return database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ userID, mediaID }))
			.executeTakeFirst()
			.then(singleDeletionResultAsNullOrUndefined);
	},
	async find(userID, mediaID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst();
	},
};
