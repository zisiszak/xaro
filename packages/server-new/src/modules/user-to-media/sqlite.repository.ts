import { type Selectable } from 'kysely';
import { database, logger } from '~/index.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { type UserToMediaTableSchema } from './sqlite.table.js';

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

	find: (
		userID: number,
		mediaID: number,
	) => Promise<Selectable<UserToMediaTableSchema> | undefined>;
}

export const userToMediaRepository: UserToMediaRepository = {
	save: async (userID, mediaID) =>
		insertRowOnConflictDoNothing('UserToMedia', { userID, mediaID }),
	remove: async (userID, mediaID) => {
		await database
			.deleteFrom('UserToMedia')
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst();
		logger.info({ userID, mediaID }, `User linked to Media.`);
	},
	find: async (userID, mediaID) =>
		database
			.selectFrom('UserToMedia')
			.selectAll()
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst(),
};
