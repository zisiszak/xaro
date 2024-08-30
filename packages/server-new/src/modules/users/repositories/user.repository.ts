import { xaro } from '~/index.js';
import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { fileRepository } from '~/modules/files/index.js';
import {
	checkExistsByColumn,
	findByColumn,
	findByID,
	insertRow,
	insertRowOnConflictDoNothing,
} from '~/shared/database/utils.js';

export interface UserRepository {
	findByID(userID: number): Promise<TableSelection<'User'> | undefined>;
	findByUsername(username: string): Promise<TableSelection<'User'> | undefined>;

	isUsernameTaken(username: string): Promise<boolean>;

	save(user: TableInsertion<'User'>): Promise<number>;

	linkMedia(userID: number, mediaID: number): Promise<undefined>;
	// unlinkContent(userID: number, contentID: number): Promise<undefined>;
	getMediaLink(userID: number, mediaID: number): Promise<boolean>;

	linkOriginalFile(userID: number, fileID: number): Promise<undefined>;
	// unlinkFile(userID: number, fileID: number): Promise<undefined>;
	getOriginalFsFileLink(userID: number, fileID: number): Promise<boolean>;

	linkPlatform(userID: number, platformID: number): Promise<undefined>;
	// unlinkPlatform(userID: number, platformID: number): Promise<undefined>;
	getPlatformLink(userID: number, platformID: number): Promise<boolean>;

	linkPlatformProfile(userID: number, platformProfileID: number): Promise<undefined>;
	// unlinkPlatformProfile(userID: number, platformProfileID: number): Promise<undefined>;
	getPlatformProfileLink(userID: number, platformProfileID: number): Promise<boolean>;

	linkPlatformCommunity(userID: number, platformCommunityID: number): Promise<undefined>;
	// unlinkPlatformCommunity(userID: number, platformCommunityID: number): Promise<undefined>;
	getPlatformCommunityLink(userID: number, platformCommunityID: number): Promise<boolean>;
}

export const userRepository: UserRepository = {
	async findByID(userID) {
		return findByID('User', userID);
	},
	async findByUsername(username) {
		return findByColumn('User', 'username', username);
	},

	async isUsernameTaken(username) {
		return checkExistsByColumn('User', 'username', username);
	},

	async save(user) {
		return insertRow('User', user);
	},

	async linkMedia(userID, mediaID) {
		return insertRowOnConflictDoNothing('UserToMedia', { userID, mediaID });
	},
	async getMediaLink(userID, mediaID) {
		return xaro.db
			.selectFrom('UserToMedia')
			.select('mediaID')
			.where((eb) => eb.and({ userID, mediaID }))
			.executeTakeFirst()
			.then(Boolean);
	},

	async linkOriginalFile(userID, fsFileID) {
		const originalFileID = await fileRepository.resolveOriginalFileID(fsFileID);

		return insertRowOnConflictDoNothing('UserToFile', {
			userID,
			fileID: originalFileID,
		});
	},
	async getOriginalFsFileLink(userID, fsFileID) {
		const originalFsFileID = await fileRepository.resolveOriginalFileID(fsFileID);

		return xaro.db
			.selectFrom('UserToFile')
			.select('fileID')
			.where((eb) => eb.and({ userID, fsFileID: originalFsFileID }))
			.executeTakeFirst()
			.then(Boolean);
	},

	async linkPlatform(userID, platformID) {
		return insertRowOnConflictDoNothing('UserToPlatform', { userID, platformID });
	},
	async getPlatformLink(userID, platformID) {
		return xaro.db
			.selectFrom('UserToPlatform')
			.select('platformID')
			.where((eb) => eb.and({ userID, platformID }))
			.executeTakeFirst()
			.then(Boolean);
	},

	async linkPlatformCommunity(userID, platformCommunityID) {
		return insertRowOnConflictDoNothing('UserToPlatformCommunity', {
			userID,
			platformCommunityID,
		});
	},
	async getPlatformCommunityLink(userID, platformCommunityID) {
		return xaro.db
			.selectFrom('UserToPlatformCommunity')
			.select('userID')
			.where((eb) => eb.and({ userID, platformCommunityID }))
			.executeTakeFirst()
			.then(Boolean);
	},

	async linkPlatformProfile(userID, platformProfileID) {
		return insertRowOnConflictDoNothing('UserToPlatformProfile', {
			userID,
			platformProfileID,
		});
	},
	async getPlatformProfileLink(userID, platformProfileID) {
		return xaro.db
			.selectFrom('UserToPlatformProfile')
			.select('platformProfileID')
			.where((eb) => eb.and({ userID, platformProfileID }))
			.executeTakeFirst()
			.then(Boolean);
	},
};
