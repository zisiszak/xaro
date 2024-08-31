import { database } from '~/index.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { type UserToPlatformCommunityRecord } from '../models/index.js';
import { UserToPlatformCommunityTable } from '../tables/user-to-platform-community.table.js';

export interface UserToPlatformCommunityRepository {
	/**
	 * Inserts a new row, linking the provided `userID` and `platformCommunityID`.
	 * If there is an existing link, no changes are made.
	 */
	save(userID: number, platformCommunityID: number): Promise<void>;

	/**
	 * Removes the row linking the provided `userID` and `platformCommunityID`, if it exists.
	 */
	remove(userID: number, platformCommunityID: number): Promise<void>;

	exists(userID: number, platformCommunityID: number): Promise<boolean>;

	find(
		userID: number,
		platformCommunityID: number,
	): Promise<UserToPlatformCommunityRecord | undefined>;
}

const TABLE = UserToPlatformCommunityTable.name;

export const userToPlatformCommunityRepository: UserToPlatformCommunityRepository = {
	async save(userID, platformCommunityID) {
		return insertRowOnConflictDoNothing(TABLE, { userID, platformCommunityID });
	},
	async remove(userID, platformCommunityID) {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ platformCommunityID, userID }))
			.limit(1)
			.executeTakeFirst();
	},
	async exists(userID, platformCommunityID) {
		return database
			.selectFrom(TABLE)
			.select('userID')
			.where((eb) => eb.and({ platformCommunityID, userID }))
			.limit(1)
			.executeTakeFirst()
			.then(Boolean);
	},
	async find(userID, platformCommunityID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ platformCommunityID, userID }))
			.limit(1)
			.executeTakeFirst();
	},
};
