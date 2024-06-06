import { db, logger } from '../../index.js';
import { $callSelect } from '../../libs/kysely/index.js';
import {
	organiseContentFilePaths,
	type OrganisedContentFilePaths,
} from '../../services/content/file-management/organise-content-files.js';
import { contentFileCategoriesMap } from '../model/shared/content-file-categories.js';
import { type ContentKind } from '../model/shared/content-kinds.js';
import {
	type ContentFile,
	type ContentUserStats,
	type UserLinkedContent,
} from '../model/tables/index.js';

export type RelatedContentData = {
	files: OrganisedContentFilePaths;
	originalContentFile: ContentFile.Selection;
	userLibraryData: UserLinkedContent.Selection | null;
	userStats: ContentUserStats.Selection | null;
	sorting: {
		tags: {
			id: number;
			displayName: string;
		}[];
	};
	includedInPlaylists: number[];
};

export const getRelatedContentData = async ({
	contentId,
	contentKind,
	userId,
}: {
	contentId: number;
	contentKind: ContentKind;
	userId: number;
}): Promise<RelatedContentData> => {
	try {
		const files = db
			.selectFrom('ContentFile')
			.selectAll()
			.where('linkedContentId', '=', contentId)
			.execute();
		const libraryData = db
			.selectFrom('UserLinkedContent')
			.selectAll()
			.where('linkedContentId', '=', contentId)
			.where('linkedUserId', '=', userId)
			.$call($callSelect.first);
		const userStats = db
			.selectFrom('ContentUserStats')
			.selectAll()
			.where('linkedUserId', '=', userId)
			.where('linkedContentId', '=', contentId)
			.$call($callSelect.first);
		const playlistIds = await db
			.selectFrom('GroupingPlaylistLinkedContent')
			.innerJoin(
				'GroupingPlaylist',
				'GroupingPlaylist.id',
				'GroupingPlaylistLinkedContent.linkedGroupingPlaylistId',
			)
			.select([
				'GroupingPlaylistLinkedContent.linkedGroupingPlaylistId',
				'GroupingPlaylist.id',
			])
			.where((eb) =>
				eb.and([
					eb('GroupingPlaylist.linkedUserId', '=', userId),
					eb(
						'GroupingPlaylistLinkedContent.linkedContentId',
						'=',
						contentId,
					),
				]),
			)
			.execute()
			.then((result) => result.map((x) => x.id));
		const sortingTags = await db
			.selectFrom('SortingTag')
			.innerJoin(
				'SortingTagLinkedContent',
				'SortingTag.id',
				'SortingTagLinkedContent.linkedSortingTagId',
			)
			.select([
				'SortingTag.displayName',
				'SortingTag.id',
				'SortingTagLinkedContent.linkedSortingTagId as id',
			])
			.where((eb) =>
				eb.and([
					eb(
						'SortingTagLinkedContent.linkedContentId',
						'=',
						contentId,
					),
					eb.or([
						eb('SortingTag.linkedUserId', '=', userId),
						eb('SortingTag.linkedUserId', 'is', null),
					]),
				]),
			)
			.execute();

		const result = {
			userLibraryData: (await libraryData) ?? null,
			userStats: (await userStats) ?? null,
			includedInPlaylists: playlistIds,
			sorting: {
				tags: sortingTags,
			},
		} as RelatedContentData;

		const f = await files;
		if (f.length === 0) {
			return Promise.reject('No media files found.');
		}

		const original = f.find(
			(file) => file.category === contentFileCategoriesMap.ORIGINAL,
		);
		if (typeof original === 'undefined') {
			return Promise.reject('Original media file could not be located.');
		}
		result.originalContentFile = original;

		result.files = organiseContentFilePaths(
			contentKind,
			f,
			result.userLibraryData?.preferredThumbnailId,
		);

		return result;
	} catch (err) {
		logger.error(
			{ error: err },
			'getRelatedMediaInfo: Unhandled exception.',
		);
		return Promise.reject();
	}
};
