import { type Kysely } from 'kysely';
import type {
	Content,
	ContentFile,
	ContentUpload,
	ContentUserStats,
	GroupingPlaylist,
	GroupingPlaylistLinkedContent,
	Person,
	Platform,
	PlatformCommunity,
	PlatformLinkedContent,
	PlatformProfile,
	Plugin,
	SortingCategory,
	SortingGenre,
	SortingTag,
	SortingTagLinkedContent,
	User,
	UserLinkedContent,
	UserLinkedPlatform,
	UserLinkedPlatformCommunity,
	UserLinkedPlatformProfile,
} from './tables/index.js';

export interface DatabaseSchema {
	Content: Content.Model;
	ContentFile: ContentFile.Model;
	ContentUpload: ContentUpload.Model;
	ContentUserStats: ContentUserStats.Model;

	Person: Person.Model;

	Plugin: Plugin.Model;

	Platform: Platform.Model;
	PlatformCommunity: PlatformCommunity.Model;
	PlatformProfile: PlatformProfile.Model;
	// PlatformDownloadQueue: PlatformDownloadQueue.Model;
	PlatformLinkedContent: PlatformLinkedContent.Model;

	User: User.Model;
	UserLinkedContent: UserLinkedContent.Model;
	UserLinkedPlatform: UserLinkedPlatform.Model;
	UserLinkedPlatformCommunity: UserLinkedPlatformCommunity.Model;
	UserLinkedPlatformProfile: UserLinkedPlatformProfile.Model;

	GroupingPlaylist: GroupingPlaylist.Model;
	GroupingPlaylistLinkedContent: GroupingPlaylistLinkedContent.Model;

	SortingCategory: SortingCategory.Model;
	SortingGenre: SortingGenre.Model;
	SortingTag: SortingTag.Model;
	SortingTagLinkedContent: SortingTagLinkedContent.Model;
}

export type Database = Kysely<DatabaseSchema>;
