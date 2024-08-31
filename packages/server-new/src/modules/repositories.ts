import { creatorRepository } from './creators/index.js';
import { fileFormatRepository, fileRepository, userToFileRepository } from './files/index.js';
import { fileToMediaRepository, mediaRepository, userToMediaRepository } from './media/index.js';
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
import { userMediaStatsRepository, userRepository } from './users/index.js';

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
