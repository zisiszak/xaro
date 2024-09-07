import { database, logger } from '~/index.js';
import { type TableSelection } from '~/modules/database.schema.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { UserToMediaTable } from '../tables/user-to-media.table.js';

const TABLE = UserToMediaTable.name;

export interface UserToMediaRepository {
	/**
	 * Inserts a new row, linking the provided `userID` and `mediaID`.
	 * If there is an existing link, no changes are made.
	 */
	save: (userID: number, mediaID: number) => Promise<void>;

	/**
	 * Removes the row linking the provided `userID` and `mediaID`, if it exists.
	 */
	remove: (userID: number, mediaID: number) => Promise<void>;

	find: (userID: number, mediaID: number) => Promise<TableSelection<'UserToMedia'> | undefined>;
}

export const userToMediaRepository: UserToMediaRepository = {
	save: async (userID, mediaID) => insertRowOnConflictDoNothing(TABLE, { userID, mediaID }),
	remove: async (userID, mediaID) => {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst();
		logger.info({ userID, mediaID }, `User linked to Media.`);
	},
	find: async (userID, mediaID) =>
		database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst(),
};
