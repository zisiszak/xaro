import { database } from '~/index.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { type UserToPlatformRecord } from '../models/index.js';
import { UserToPlatformTable } from '../tables/user-to-platform.table.js';

export interface UserToPlatformRepository {
	/**
	 * Inserts a new row, linking the provided `userID` and `platformID`.
	 * If there is an existing link, no changes are made.
	 */
	save(userID: number, platformID: number): Promise<void>;

	/**
	 * Removes the row linking the provided `userID` and `platformID`, if it exists.
	 */
	remove(userID: number, platformID: number): Promise<void>;

	exists(userID: number, platformID: number): Promise<boolean>;

	find(userID: number, platformID: number): Promise<UserToPlatformRecord | undefined>;
}

const TABLE = UserToPlatformTable.name;

export const userToPlatformRepository: UserToPlatformRepository = {
	async save(userID, platformID) {
		return insertRowOnConflictDoNothing(TABLE, { userID, platformID });
	},
	async remove(userID, platformID) {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ platformID, userID }))
			.limit(1)
			.executeTakeFirst();
	},
	async exists(userID, platformID) {
		return database
			.selectFrom(TABLE)
			.select('userID')
			.where((eb) => eb.and({ platformID, userID }))
			.limit(1)
			.executeTakeFirst()
			.then(Boolean);
	},
	async find(userID, platformID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ platformID, userID }))
			.limit(1)
			.executeTakeFirst();
	},
};
