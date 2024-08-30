import { ContentLinkedFileRepository } from '../content-linked-file/index.js';
import {
	ContentLinkedFileRelationshipEnum,
	type ContentLinkedFileRelationship,
} from '../content-linked-file/model.js';
import { FileRepository } from '../files/index.js';
import { type FileDto } from '../files/model.js';
import {
	PlatformCommunityRepository,
	PlatformProfileRepository,
	PlatformRepository,
	UserLinkedPlatformCommunityRepository,
	UserLinkedPlatformProfileRepository,
	UserLinkedPlatformRepository,
	type PlatformContentMetadata,
} from '../platform/index.js';
import { UserContentStatsRepository } from '../user-content-stats/index.js';
import { type UserContentStatsDto } from '../user-content-stats/model.js';
import { UserLinkedContentRepository } from '../user-linked-content/index.js';
import { ContentRepository } from './index.js';
import { type ContentDto } from './model.js';

export interface ContentInfo extends ContentDto {
	files: FileDto[];
	user_stats: UserContentStatsDto | null;
}

export const getContentInfo = async (
	contentID: number,
	userID: number,
): Promise<ContentInfo | null> => {
	const content = await ContentRepository.findByID(contentID);
	if (!content) return null;

	const files = await FileRepository.findAllByUserIDLinkAndContentIDLink(userID, contentID);
	const stats = await UserContentStatsRepository.findByUserIDandContentID(userID, contentID);

	return { ...content, files, user_stats: stats ?? null };
};

interface FilesToLink {
	content?: number[];
	thumbnails?: number[];
	previews?: number[];
	subtitles?: number[];
	metadata?: number[];
	dump?: number[];
}
interface ImportContentProps {
	userID: number;
	files?: FilesToLink;
	platform?: {
		platformID: number;
		profileID?: number;
		communityID?: number;
		sourceID?: string;
		sourceUrl?: string;
		metadata?: PlatformContentMetadata;
	};
}
/**
 *
 * @return {number} the `id` of the new content row.
 */
export async function importContent({
	userID,
	files,
	platform,
}: ImportContentProps): Promise<number> {
	// check through provided platform data
	let platformData: null | {
		platformID: number;
		platformCommunityID?: number;
		platformProfileID?: number;
		platformSourceId?: string;
		platformSourceUrl?: string;
		metadata: PlatformContentMetadata;
	} = null;

	if (platform) {
		const platformID = platform.platformID;
		if (!(await PlatformRepository.findByID(platform.platformID)))
			throw 'platform ID not found.';
		if (!(await UserLinkedPlatformRepository.checkLink(userID, platformID)))
			throw 'user not linked to platform';

		if (
			(!!platform.sourceID || !!platform.sourceUrl) &&
			(await ContentRepository.checkIfPlatformContentExists(platformID, {
				kind: typeof platform.sourceID === 'string' ? 'id' : 'url',
				value:
					typeof platform.sourceID === 'string' ? platform.sourceID : platform.sourceUrl!,
			}))
		)
			throw 'platform content already exists';

		platformData = {
			platformID: platformID,
			platformSourceUrl: platform.sourceUrl,
			platformSourceId: platform.sourceID,
			metadata: platform.metadata ?? {},
		};

		if (platform.communityID) {
			const platformCommunityID = platform.communityID;
			if (!(await PlatformCommunityRepository.findByID(platformCommunityID)))
				throw 'platform community ID not found.';
			if (
				!(await UserLinkedPlatformCommunityRepository.checkLink(
					userID,
					platformCommunityID,
				))
			)
				throw 'user not linked to platform community.';

			platformData.platformCommunityID = platformCommunityID;
		}
		if (platform.profileID) {
			const platformProfileID = platform.profileID;
			if (!(await PlatformProfileRepository.findByID(platformProfileID)))
				throw 'platform profile ID not found.';
			if (!(await UserLinkedPlatformProfileRepository.checkLink(userID, platformProfileID)))
				throw 'user not linked to platform profile.';

			platformData.platformProfileID = platformProfileID;
		}
	}

	// checks through all file IDs to verify ownership and if they are linked already, and then sorts them accordingly. (Done this way because was initially planning to do bulk update queries per `relTag`)
	const fileSetsToUpdate =
		typeof files === 'undefined' ? [] : await arrangeFilesToUpdate(files, userID);

	// Finally add the content entry to the database
	const contentID = await ContentRepository.insert({
		...platformData,
	});

	// Link all files to the newly created content ID
	await Promise.all(
		fileSetsToUpdate.map(async (set) => {
			await Promise.all(
				set.fileIDs.map((fileID) =>
					ContentLinkedFileRepository.insert({
						contentID,
						fileID,
						relationship: set.contentRelTag,
					}),
				),
			);
		}),
	);

	await UserLinkedContentRepository.insert({
		contentID,
		userID,
	});

	return contentID;
}

async function arrangeFilesToUpdate(
	files: FilesToLink,
	userID: number,
): Promise<{ fileIDs: number[]; contentRelTag: ContentLinkedFileRelationship }[]> {
	const result: {
		fileIDs: number[];
		contentRelTag: ContentLinkedFileRelationship;
	}[] = [];
	const relTagFileMap: {
		[key in `${ContentLinkedFileRelationship}`]?: number[];
	} = {
		[ContentLinkedFileRelationshipEnum.Content]: files.content,
		[ContentLinkedFileRelationshipEnum.Dump]: files.dump,
		[ContentLinkedFileRelationshipEnum.Metadata]: files.metadata,
		[ContentLinkedFileRelationshipEnum.Preview]: files.previews,
		[ContentLinkedFileRelationshipEnum.Subtitles]: files.subtitles,
		[ContentLinkedFileRelationshipEnum.Thumbnail]: files.thumbnails,
	};

	await Promise.all(
		Object.entries(relTagFileMap).map(async ([relTag, fileIDs]) => {
			if (!fileIDs) return null;
			const fileEntries = await Promise.all(fileIDs.map(FileRepository.findByID));
			assertFileEntriesAreLinkable(fileEntries, userID);
			result.push({
				contentRelTag: Number(relTag) as ContentLinkedFileRelationship,
				fileIDs: fileEntries.map((entry) => entry.id),
			});
		}),
	);

	return result;
}

function assertFileEntriesAreLinkable(
	fileEntries: (FileDto | undefined)[],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_userID: number,
): asserts fileEntries is FileDto[] {
	void fileEntries.some((entry) => {
		if (typeof entry === 'undefined')
			throw 'one or more of the file ids provided do not exist.';
		// if (typeof entry.content_id === 'number')
		// throw 'one or more of the file ids provided have existing content links.';
		// if (entry.imported_by_user_id !== userID)
		// 	throw 'one or more of the file ids provided do not belong to the user attempting to link them to content.';
	});
}
