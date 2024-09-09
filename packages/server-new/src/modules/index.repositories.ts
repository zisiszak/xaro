import { creatorRepository } from './creator/index.js';
import { fileFormatRepository } from './file-format/sqlite.repository.js';
import { fileToMediaRepository } from './file-to-media/sqlite.repository.js';
import { fileRepository } from './file/sqlite.repository.js';
import { mediaRepository } from './media/index.js';
import {
	platformCommunityRepository,
	platformMediaSourceRepository,
	platformProfileRepository,
	platformRepository,
	userToPlatformCommunityRepository,
	userToPlatformProfileRepository,
	userToPlatformRepository,
} from './platform/index.js';
import { mediaToSortingTagRepository, sortingTagRepository } from './sorting/index.js';
import { userMediaStatsRepository } from './user-media-stats/sqlite.repository.js';
import { userToFileRepository } from './user-to-file/sqlite.repository.js';
import { userToMediaRepository } from './user-to-media/sqlite.repository.js';
import { userRepository } from './user/sqlite.repository.js';

export const repository = {
	Creator: creatorRepository,
	File: fileRepository,
	FileFormat: fileFormatRepository,
	FileToMedia: fileToMediaRepository,
	Media: mediaRepository,
	MediaToSortingTag: mediaToSortingTagRepository,
	Platform: platformRepository,
	PlatformProfile: platformProfileRepository,
	PlatformCommunity: platformCommunityRepository,
	PlatformMediaSource: platformMediaSourceRepository,
	SortingTag: sortingTagRepository,
	User: userRepository,
	UserToMedia: userToMediaRepository,
	UserToFile: userToFileRepository,
	UserToPlatform: userToPlatformRepository,
	UserToPlatformCommunity: userToPlatformCommunityRepository,
	UserToPlatformProfile: userToPlatformProfileRepository,
	UserMediaStats: userMediaStatsRepository,
};
