// import {
// 	checkIDExistsInTable,
// 	checkIfPlatformContentAlreadyExists,
// 	checkIfUserLinkedToPlatform,
// 	checkIfUserLinkedToPlatformCommunity,
// 	checkIfUserLinkedToPlatformProfile,
// 	linkFileToContent,
// 	readFileEntryByID,
// } from '~/models/database/access.js';
// import {
// 	ContentFileRelationshipTagEnum,
// 	type ContentFileRelationshipTag,
// } from '~/models/database/tables/files.js';
// import {
// 	Content,
// 	PlatformCommunities,
// 	PlatformProfiles,
// 	Platforms,
// 	type Files,
// } from '~/models/database/tables/index.js';
// import { type PlatformContentMetadata } from '~/models/platform-content-metadata.js';

// interface FilesToLink {
// 	content?: number[];
// 	thumbnails?: number[];
// 	previews?: number[];
// 	subtitles?: number[];
// 	metadata?: number[];
// 	dump?: number[];
// }
// interface Props {
// 	userID: number;
// 	files?: FilesToLink;
// 	platform?: {
// 		platformID: number;
// 		profileID?: number;
// 		communityID?: number;
// 		sourceID?: string;
// 		sourceUrl?: string;
// 		metadata?: PlatformContentMetadata;
// 	};
// 	permissions?: {
// 		/** @default true */
// 		isPrivate?: boolean;
// 		/** @default false */
// 		isHidden?: boolean;
// 	};
// }
// /**
//  *
//  * @return {number} the `id` of the new content row.
//  */
// export async function importContent({
// 	userID,
// 	files,
// 	platform,
// 	permissions: { isPrivate = true, isHidden = false } = { isPrivate: true, isHidden: false },
// }: Props): Promise<number> {
// 	// check through provided platform data
// 	let platformData: null | {
// 		platform_id: number;
// 		platform_community_id?: number;
// 		platform_profile_id?: number;
// 		platform_sourceid?: string;
// 		platform_source_url?: string;
// 		platform_metadata: PlatformContentMetadata;
// 	} = null;

// 	if (platform) {
// 		const platformID = platform.platformID;
// 		if (!(await checkIDExistsInTable(Platforms.name, platformID)))
// 			throw 'platform ID not found.';
// 		if (!(await checkIfUserLinkedToPlatform(platformID, userID)))
// 			throw 'user not linked to platform';

// 		if (
// 			(!!platform.sourceID || !!platform.sourceUrl) &&
// 			typeof (await checkIfPlatformContentAlreadyExists({
// 				platformID,
// 				sourceID: platform.sourceID!,
// 				sourceUrl: platform.sourceUrl!,
// 			})) === 'number'
// 		)
// 			throw 'platform content already exists';

// 		platformData = {
// 			platform_id: platformID,
// 			platform_source_url: platform.sourceUrl,
// 			platform_sourceid: platform.sourceID,
// 			platform_metadata: platform.metadata ?? {},
// 		};

// 		if (platform.communityID) {
// 			const platformCommunityID = platform.communityID;
// 			if (!(await checkIDExistsInTable(PlatformCommunities.name, platformCommunityID)))
// 				throw 'platform community ID not found.';
// 			if (!(await checkIfUserLinkedToPlatformCommunity(platformCommunityID, userID)))
// 				throw 'user not linked to platform community.';

// 			platformData.platform_community_id = platformCommunityID;
// 		}
// 		if (platform.profileID) {
// 			const platformProfileID = platform.profileID;
// 			if (!(await checkIDExistsInTable(PlatformProfiles.name, platformProfileID)))
// 				throw 'platform profile ID not found.';
// 			if (!(await checkIfUserLinkedToPlatformProfile(platformProfileID, userID)))
// 				throw 'user not linked to platform profile.';

// 			platformData.platform_profile_id = platformProfileID;
// 		}
// 	}

// 	// checks through all file IDs to verify ownership and if they are linked already, and then sorts them accordingly. (Done this way because was initially planning to do bulk update queries per `relTag`)
// 	const fileSetsToUpdate =
// 		typeof files === 'undefined' ? [] : await arrangeFilesToUpdate(files, userID);

// 	// Finally add the content entry to the database
// 	const contentID = await Content.insert({
// 		imported_by_user_id: userID,
// 		is_private: isPrivate,
// 		is_hidden: isHidden,
// 		...platformData,
// 	});

// 	// Link all files to the newly created content ID
// 	await Promise.all(
// 		fileSetsToUpdate.map(async (set) => {
// 			await Promise.all(
// 				set.fileIDs.map((fileID) =>
// 					linkFileToContent({
// 						contentID,
// 						fileID,
// 						contentRelTag: set.contentRelTag,
// 					}),
// 				),
// 			);
// 		}),
// 	);

// 	return contentID;
// }

// async function arrangeFilesToUpdate(
// 	files: FilesToLink,
// 	userID: number,
// ): Promise<{ fileIDs: number[]; contentRelTag: ContentFileRelationshipTag }[]> {
// 	const result: {
// 		fileIDs: number[];
// 		contentRelTag: ContentFileRelationshipTag;
// 	}[] = [];
// 	const relTagFileMap: {
// 		[key in `${ContentFileRelationshipTag}`]?: number[];
// 	} = {
// 		[ContentFileRelationshipTagEnum.Content]: files.content,
// 		[ContentFileRelationshipTagEnum.Dump]: files.dump,
// 		[ContentFileRelationshipTagEnum.Metadata]: files.metadata,
// 		[ContentFileRelationshipTagEnum.Preview]: files.previews,
// 		[ContentFileRelationshipTagEnum.Subtitles]: files.subtitles,
// 		[ContentFileRelationshipTagEnum.Thumbnail]: files.thumbnails,
// 	};

// 	await Promise.all(
// 		Object.entries(relTagFileMap).map(async ([relTag, fileIDs]) => {
// 			if (!fileIDs) return null;
// 			const fileEntries = await Promise.all(fileIDs.map(readFileEntryByID));
// 			assertFileEntriesAreLinkable(fileEntries, userID);
// 			result.push({
// 				contentRelTag: Number(relTag) as ContentFileRelationshipTag,
// 				fileIDs: fileEntries.map((entry) => entry.id),
// 			});
// 		}),
// 	);

// 	return result;
// }

// function assertFileEntriesAreLinkable(
// 	fileEntries: (Files.Selection | undefined)[],
// 	userID: number,
// ): asserts fileEntries is Files.Selection[] {
// 	void fileEntries.some((entry) => {
// 		if (typeof entry === 'undefined')
// 			throw 'one or more of the file ids provided do not exist.';
// 		if (typeof entry.content_id === 'number')
// 			throw 'one or more of the file ids provided have existing content links.';
// 		if (entry.imported_by_user_id !== userID)
// 			throw 'one or more of the file ids provided do not belong to the user attempting to link them to content.';
// 	});
// }
