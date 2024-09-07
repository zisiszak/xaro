import { database } from '~/index.js';
import { insertRowOnConflictDoNothing } from '~/shared/index.js';
import { type UserToFileRecord } from '../models/index.js';
import { UserToFileTable } from '../tables/user-to-file.table.js';
import { fileRepository } from './file.repository.js';

const TABLE = UserToFileTable.name;

export interface UserToFileRepository {
	/**
	 * Inserts a new row, linking the provided `userID` and `originalFileID`.
	 * If there is an existing link, no changes are made.
	 */
	save(userID: number, originalFileID: number): Promise<void>;

	/**
	 * Removes the row linking the provided `userID` and `originalFileID`, if it exists.
	 */
	remove(userID: number, originalFileID: number): Promise<void>;

	findByAnyFileID(userID: number, anyFileID: number): Promise<UserToFileRecord | undefined>;

	findByOriginalFileID(
		userID: number,
		originalFileID: number,
	): Promise<UserToFileRecord | undefined>;

	findByLibraryPath(userID: number, libraryPath: string): Promise<UserToFileRecord | undefined>;
}

export const userToFileRepository: UserToFileRepository = {
	async save(userID, originalFileID) {
		await insertRowOnConflictDoNothing(TABLE, {
			originalFileID,
			userID,
		});
	},
	async remove(userID, originalFileID) {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ userID, originalFileID }))
			.executeTakeFirst();
	},
	async findByOriginalFileID(userID, originalFileID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ userID, originalFileID }))
			.limit(1)
			.executeTakeFirst();
	},
	async findByAnyFileID(userID, fileID) {
		const originalFileID = await fileRepository.resolveOriginalFileID(fileID);
		return this.findByOriginalFileID(userID, originalFileID);
	},
	async findByLibraryPath(userID, libraryPath) {
		const originalFileID =
			await fileRepository.resolveOriginalFileIDFromLibraryPath(libraryPath);
		return this.findByOriginalFileID(userID, originalFileID);
	},
};
