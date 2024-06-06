import path from 'path';
import { linkUserToPlatformCommunity } from '~/data/access/platform-community.js';
import { linkUserToPlatformProfile } from '~/data/access/platform-profile.js';
import { getPlatformDetails } from '~/data/access/platform.js';
import {
	contentFileCategoriesMap,
	errorOutcome,
	isErrorOutcome,
	usePluginModule,
	type ExtractedContent,
	type PlatformManager,
} from '~/exports.js';
import { db, logger } from '~/index.js';
import { importContent } from '../content/import.js';
import { extractAndAddPlatformCommunityIfNotExists } from './platform-community.js';
import { extractAndAddPlatformProfileIfNotExists } from './platform-profile.js';

export const importExtractedContent = async (
	extracted: ExtractedContent,
): Promise<number> => {
	const {
		queuedByUserId,
		files,
		metadata,
		source: {
			pageUrl,
			platform,
			platformId: providedPlatformId,
			platformCommunityName,
			platformProfileName,
			sourceId,
			sourceUrl,
		},
	} = extracted;

	if (
		typeof providedPlatformId !== 'number' &&
		typeof platform !== 'string'
	) {
		return Promise.reject(
			errorOutcome({
				message:
					'Platform or PlatformId must be provided to import extracted content.',
				context: {
					sourceId,
					platformProfileName,
					platformCommunityName,
				},
			}),
		);
	}

	// TODO: this should be moved to it's own separate function

	const platformDetails = await getPlatformDetails(
		providedPlatformId ?? platform!,
	).catch((err) => {
		return errorOutcome({
			message: 'Failed to find platform that matched provided params.',
			context: {
				providedPlatformName: platform,
				providedPlatformId: providedPlatformId,
			},
			caughtException: err,
		});
	});
	if (isErrorOutcome(platformDetails)) {
		return Promise.reject(platformDetails);
	}

	const { platformManager, id: platformId } = platformDetails;

	const mainFile = files?.find((file) => file.kind === 'main');
	const thumbFile = files?.find((file) => file.kind === 'thumbnail');

	let existingContent: { sourceId: null | string; id: number } | undefined =
		undefined;
	if (typeof platformId === 'number' || platform) {
		existingContent = await db
			.selectFrom('PlatformLinkedContent')
			.select(['id', 'sourceId'])
			.where((eb) =>
				eb.and([
					eb('linkedPlatformId', '=', platformId),
					eb('sourceId', '=', sourceId),
				]),
			)
			.executeTakeFirst();
	}

	if (
		typeof existingContent === 'undefined' &&
		typeof mainFile === 'undefined'
	) {
		return Promise.reject(
			errorOutcome({
				message:
					"Original content file must already be present in database if importing extracted content without any 'main' files.",
			}),
		);
	}

	const {
		title,
		description,
		ageLimit,
		likeCount,
		likeToDislikeRatio,
		commentCount,
		viewCount,
		bodyText,
		rawJSON,
	} = metadata ?? {};

	const genres = JSON.stringify(metadata?.genres ?? []);
	const tags = JSON.stringify(metadata?.tags ?? []);
	const categories = JSON.stringify(metadata?.categories ?? []);
	const datePublished = metadata?.datePublished?.toString();
	const dateModified = metadata?.dateModified?.toString();
	const sourceMetadataDump = JSON.stringify(rawJSON);

	if (typeof mainFile === 'undefined') {
		// TODO: Make this import all associated files rather than just metadata on update.
		if (metadata !== null) {
			return db
				.updateTable('PlatformLinkedContent')
				.set({
					title,
					description,
					ageLimit,
					likeCount,
					genres,
					tags,
					categories,
					likeToDislikeRatio,
					bodyText,
					viewCount,
					commentCount,
					datePublished,
					dateModified,
					sourceMetadataDump,
				})
				.where('id', '=', existingContent!.id)
				.execute()
				.then(() => {
					logger.info({
						message:
							'Metadata successfully updated for PlatformLinkedMedia.',
						context: { platformLinkedMediaId: existingContent!.id },
					});
					return existingContent!.id;
				});
		}
		logger.info({
			message: 'No updates made to existing PlatformLinkedMedia.',
			context: {
				platformLinkedMediaId: existingContent!.id,
			},
		});
		return existingContent!.id;
	}

	let platformProfileId: number | undefined = undefined;
	if (platformProfileName) {
		platformProfileId = await extractAndAddPlatformProfileIfNotExists({
			displayName: platformProfileName,
			linkedPlatformId: platformId,
			sourceId: platformProfileName,
			name: platformProfileName,
		})
			.catch(() =>
				platformManager
					? usePluginModule<PlatformManager>(platformManager)
							?.defaultItems.platformProfileId ?? undefined
					: undefined,
			)
			.then(async (id) => {
				if (typeof id === 'number') {
					await linkUserToPlatformProfile({
						platformProfileId: id,
						userId: queuedByUserId,
					});
				}
				return id;
			});
	}

	let platformCommunityId: number | undefined = undefined;
	if (platformCommunityName) {
		platformCommunityId = await extractAndAddPlatformCommunityIfNotExists({
			displayName: platformCommunityName,
			linkedPlatformId: platformId,
			sourceId: platformCommunityName,
			name: platformCommunityName,
		})
			.catch(() => undefined)
			.then(async (id) => {
				if (typeof id === 'number') {
					await linkUserToPlatformCommunity({
						userId: queuedByUserId,
						platformCommunityId: id,
					});
				}
				return id;
			});
	}

	return importContent({
		userId: queuedByUserId,
		options: {
			createOptimisedMedia: true,
			generateDefaultThumbnails: true,
		},
		sources: {
			main: {
				category: contentFileCategoriesMap.ORIGINAL,
				currentFilePath: mainFile.filePath,
				kind: 'file',
				originalFilename: path.basename(mainFile.filePath),
				sourceUrl: mainFile.sourceUrl,
			},
			originalThumbnail: thumbFile
				? {
						category: contentFileCategoriesMap.THUMB_ORIGINAL,
						currentFilePath: thumbFile.filePath,
						label: 'original',
						kind: 'file',
						originalFilename: path.basename(thumbFile.filePath),
					}
				: undefined,
		},
		metadata: {
			platform: {
				title,
				description,
				ageLimit,
				likeCount,
				genres,
				tags,
				categories,
				likeToDislikeRatio,
				bodyText,
				viewCount,
				commentCount,
				datePublished,
				dateModified,
				sourceMetadataDump,

				sourceId,
				sourceUrl,
				sourcePageUrl: pageUrl,

				linkedPlatformId: platformId,
				linkedPlatformCommunityId: platformCommunityId,
				linkedPlatformProfileId: platformProfileId,
			},
		},
	});
}
