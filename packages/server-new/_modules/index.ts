import { type ContentLinkedFileRepository } from './content-linked-file/index.js';
import { type ContentRepository } from './content/index.js';
import { type CreatorRepository } from './creator/index.js';
import { type FileFormatRepository, type FileRepository } from './files/index.js';
import {
	type PlatformCommunityRepository,
	type PlatformProfileRepository,
	type PlatformRepository,
	type UserLinkedPlatformCommunityRepository,
	type UserLinkedPlatformProfileRepository,
	type UserLinkedPlatformRepository,
} from './platform/index.js';
import { type SortingTagLinkedContentRepository } from './sorting-tag-linked-content/index.js';
import { type SortingTagRepository } from './sorting-tag/index.js';
import { type UserContentStatsRepository } from './user-content-stats/index.js';
import { type UserLinkedContentRepository } from './user-linked-content/index.js';
import { type UserLinkedFileRepository } from './user-linked-file/index.js';
import { type UserRepository } from './user/index.js';

export * from './content-linked-file/index.js';
export * from './content/index.js';
export * from './creator/index.js';
export * from './file-format/index.js';
export * from './files/index.js';
export * from './platform-community/index.js';
export * from './platform-profile/index.js';
export * from './platform/index.js';
export * from './sorting-tag-linked-content/index.js';
export * from './sorting-tag/index.js';
export * from './user-content-stats/index.js';
export * from './user-linked-content/index.js';
export * from './user-linked-platform-community/index.js';
export * from './user-linked-platform-profile/index.js';
export * from './user-linked-platform/index.js';
export * from './user/index.js';

export interface Schema {
	// User
	[UserRepository.TABLE_NAME]: UserRepository.Table;

	// Files
	[FileFormatRepository.TABLE_NAME]: FileFormatRepository.Table;
	[FileRepository.TABLE_NAME]: FileRepository.Table;
	[UserLinkedFileRepository.TABLE_NAME]: UserLinkedFileRepository.Table;
	[ContentLinkedFileRepository.TABLE_NAME]: ContentLinkedFileRepository.Table;

	// Sorting
	[SortingTagRepository.TABLE_NAME]: SortingTagRepository.Table;

	// Content
	[ContentRepository.TABLE_NAME]: ContentRepository.Table;
	[UserContentStatsRepository.TABLE_NAME]: UserContentStatsRepository.Table;
	[UserLinkedContentRepository.TABLE_NAME]: UserLinkedContentRepository.Table;
	[SortingTagLinkedContentRepository.TABLE_NAME]: SortingTagLinkedContentRepository.Table;

	// Creators
	[CreatorRepository.TABLE_NAME]: CreatorRepository.Table;

	// Platforms
	[PlatformRepository.TABLE_NAME]: PlatformRepository.Table;
	[UserLinkedPlatformRepository.TABLE_NAME]: UserLinkedPlatformRepository.Table;

	[PlatformProfileRepository.TABLE_NAME]: PlatformProfileRepository.Table;
	[UserLinkedPlatformProfileRepository.TABLE_NAME]: UserLinkedPlatformProfileRepository.Table;

	[PlatformCommunityRepository.TABLE_NAME]: PlatformCommunityRepository.Table;
	[UserLinkedPlatformCommunityRepository.TABLE_NAME]: UserLinkedPlatformCommunityRepository.Table;
}
