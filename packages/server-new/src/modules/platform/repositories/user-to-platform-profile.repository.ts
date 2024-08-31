import { database } from '~/index.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { type UserToPlatformProfileRecord } from '../models/index.js';
import { UserToPlatformProfileTable } from '../tables/user-to-platform-profile.table.js';

export interface UserToPlatformProfileRepository {
	/**
	 * Inserts a new row, linking the provided `userID` and `platformProfileID`.
	 * If there is an existing link, no changes are made.
	 */
	save(userID: number, platformProfileID: number): Promise<void>;

	/**
	 * Removes the row linking the provided `userID` and `platformProfileID`, if it exists.
	 */
	remove(userID: number, platformProfileID: number): Promise<void>;

	exists(userID: number, platformProfileID: number): Promise<boolean>;

	find(
		userID: number,
		platformProfileID: number,
	): Promise<UserToPlatformProfileRecord | undefined>;
}

const TABLE = UserToPlatformProfileTable.name;

export const userToPlatformProfileRepository: UserToPlatformProfileRepository = {
	async save(userID, platformProfileID) {
		return insertRowOnConflictDoNothing(TABLE, { userID, platformProfileID });
	},
	async remove(userID, platformProfileID) {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ platformProfileID, userID }))
			.limit(1)
			.executeTakeFirst();
	},
	async exists(userID, platformProfileID) {
		return database
			.selectFrom(TABLE)
			.select('userID')
			.where((eb) => eb.and({ platformProfileID, userID }))
			.limit(1)
			.executeTakeFirst()
			.then(Boolean);
	},
	async find(userID, platformProfileID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ platformProfileID, userID }))
			.limit(1)
			.executeTakeFirst();
	},
};
