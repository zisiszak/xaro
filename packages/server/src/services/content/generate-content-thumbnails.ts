import path from 'path';
import { sequentialAsync } from '~/utils/async/sequential-async.js';
import { __coreParams } from '../../config/core-params.js';
import {
	videoExtensions,
	type VideoContentFileExtension,
} from '../../data/model/shared/content-kinds.js';
import { contentFileCategoriesMap } from '../../exports.js';
import { config, db, logger } from '../../index.js';
import { generateThumbnails } from '../../libs/ffmpeg/thumbnails/generate-thumbnails.js';
import { type ThumbnailConfig } from '../../libs/ffmpeg/thumbnails/parse-props.js';
import { $callCheck, selectFirst } from '../../libs/kysely/index.js';
import {
	ErrorOutcome,
	errorOutcome,
	isErrorOutcome,
} from '../../utils/outcomes.js';
import { importNewMediaFile } from './import.js';

export type GenerateMediaThumbnailsProps = {
	mediaId: number;
	/**
	 *  Defaults to {@link __coreParams.contentDefaultThumbnails} if no thumbnail configs are provided
	 * */
	thumbnails?: ThumbnailConfig[];
};

export const generateMediaThumbnails = async ({
	mediaId,
	thumbnails,
}: {
	mediaId: number;
	thumbnails?: ThumbnailConfig[];
}) => {
	if (Array.isArray(thumbnails) && thumbnails.length === 0) {
		return Promise.reject(
			errorOutcome(
				{
					message: 'No thumbnail configurations provided.',
					context: {
						mediaId,
					},
				},
				logger.error,
			),
		);
	}
	const thumbs = thumbnails ?? __coreParams.contentDefaultThumbnails;

	const originalMediaFile = await db
		.selectFrom('ContentFile')
		.selectAll('ContentFile')
		.where('ContentFile.linkedContentId', '=', mediaId)
		.where('ContentFile.category', '=', contentFileCategoriesMap.ORIGINAL)
		.$call(selectFirst);
	if (typeof originalMediaFile === 'undefined') {
		return Promise.reject(
			errorOutcome(
				{
					context: { mediaId, thumbs },
					message:
						'No original media file found to generate thumbnail(s) from.',
				},
				logger.error,
			),
		);
	}

	const { extension, path: relPath } = originalMediaFile;
	const filePath = path.join(config.mediaDir, relPath);

	if (
		!(
			videoExtensions.includes(extension as VideoContentFileExtension) ||
			extension === '.gif'
		)
	) {
		return Promise.reject(
			errorOutcome(
				{
					message: 'Unsupported original media',
					context: {
						mediaId,
						filePath,
						extension,
					},
				},
				logger.error,
			),
		);
	}

	if (thumbs === __coreParams.contentDefaultThumbnails) {
		const alreadyGenerated = await db
			.selectFrom('ContentFile')
			.select('id')
			.where((eb) =>
				eb.and([
					eb('linkedContentId', '=', mediaId),
					eb(
						'category',
						'=',
						contentFileCategoriesMap.THUMB_GENERATED,
					),
					eb(
						'label',
						'=',
						__coreParams.contentDefaultThumbnails[0]!.label,
					),
				]),
			)
			.$call($callCheck.anyExist);
		if (alreadyGenerated) {
			logger.info({
				context: {
					mediaId: mediaId,
				},
				message: 'Default thumbnail already generated.',
			});
			return;
		}
	}

	return await generateThumbnails({
		filePath: filePath,
		outputDir: config.awaitingImportDir,
		thumbnails: thumbs,
	}).then(async (thumbs) => {
		const successfulThumbs = thumbs.filter(
			<T>(v: T | ErrorOutcome<any>): v is T => !isErrorOutcome(v),
		);

		return await Promise.all(
			successfulThumbs.map(
				async ({ filepath, timestamp }) =>
					await importNewMediaFile({
						contentId: mediaId,
						fileSource: {
							category: contentFileCategoriesMap.THUMB_GENERATED,
							currentFilePath: filepath,
							timestamp,
						},
					}).catch((err) => {
						if (isErrorOutcome(err)) {
							logger.error(err);
							return err;
						}
						return errorOutcome(
							{
								message:
									'Unknown error when importing generated thumbnail',
								context: {
									thumbnailFile: filepath,
									mediaId,
								},
							},
							logger.error,
						);
					}),
			),
		);
	});
};

export async function generateMissingThumbnails() {
	return db
		.selectFrom('Content')
		.select('id')
		.where((eb) =>
			eb.and([
				eb('id', 'not in', (qb) =>
					qb
						.selectFrom('ContentFile')
						.select('linkedContentId as id')
						.where('category', 'in', [
							contentFileCategoriesMap.THUMB_CUSTOM,
							contentFileCategoriesMap.THUMB_GENERATED,
							contentFileCategoriesMap.THUMB_ORIGINAL,
						]),
				),
				eb.or([
					eb('kind', '=', 'video'),
					eb('id', 'in', (qb) =>
						qb
							.selectFrom('ContentFile')
							.select('linkedContentId as id')
							.where('extension', '=', '.gif')
							.where(
								'category',
								'=',
								contentFileCategoriesMap.ORIGINAL,
							),
					),
				]),
			]),
		)
		.execute()
		.then((ids) =>
			sequentialAsync(
				(id) => generateMediaThumbnails({ mediaId: id }),
				ids.map(({ id }) => id),
				true,
			),
		);
}
