import { access } from 'fs/promises';
import path from 'path';
import { __coreParams } from '../../../config/core-params.js';
import { contentFileCategoriesMap } from '../../../exports.js';
import { config, db } from '../../../index.js';
import { convertImage } from '../../../libs/sharp/convert-image.js';
import { sequentialAsync } from '../../../utils/async/sequential-async.js';
import { readImageFileDimensions } from '../../../utils/media-utils/read-image-file-dimensions.js';
import { FS_ERROR, errorOutcome } from '../../../utils/outcomes.js';
import { formatContentFileFilename } from '../file-management/format-content-filename.js';
import { resolveContentFileDirectory } from '../file-management/resolve-content-directory.js';
import { importNewMediaFile } from '../import.js';

export const createOptimisedFilesForImage = async ({
	contentId,
}: {
	contentId: number;
}) => {
	const files = await db
		.selectFrom('ContentFile')
		.selectAll()
		.where('linkedContentId', '=', contentId)
		.execute();

	if (files.length === 0) {
		return Promise.reject(
			errorOutcome({
				message: 'No files found in database for provided contentId.',
				context: {
					contentId: contentId,
				},
			}),
		);
	}

	const original = files.find(
		(file) => file.category === contentFileCategoriesMap.ORIGINAL,
	);
	if (!original) {
		return Promise.reject(
			errorOutcome({
				message:
					'No original content file exists for provided contentId.',
				context: {
					contentId: contentId,
					files,
				},
			}),
		);
	}

	// From here on, this is all for image files (TODO above for context)
	const optimisedFiles = files.filter(
		(file) => file.category === contentFileCategoriesMap.OPTIMISED,
	);
	const optimisedMissing =
		__coreParams.contentFileOptimisation.configs.filter(
			(set) =>
				optimisedFiles.some((file) => file.label === set.label) ===
				false,
		);

	if (optimisedMissing.length === 0) {
		return;
	}

	const filePath = path.join(config.mediaDir, original.path);

	await access(filePath).catch(() =>
		Promise.reject(
			errorOutcome(FS_ERROR, {
				message: 'Original content file not accessible in filesystem.',
				context: {
					filePath: filePath,
					contentFileId: original.id,
					contentId: contentId,
				},
			}),
		),
	);

	const outputDir = await resolveContentFileDirectory({
		contentId: contentId,
		contentFileCategory: contentFileCategoriesMap.OPTIMISED,
	});

	let widthIsLongEdge =
		original.width && original.height
			? original.width > original.height
				? true
				: false
			: null;
	if (widthIsLongEdge === null) {
		const { width, height } = readImageFileDimensions(filePath);
		if (!width || !height) {
			return Promise.reject(
				errorOutcome({
					message:
						'Could not read image metadata for original content file.',
					context: {
						filePath,
						contentFileId: original.id,
						contentId: contentId,
					},
				}),
			);
		}

		widthIsLongEdge = width > height;
	}

	return Promise.all(
		optimisedMissing.map(async (settings) => {
			const outputFilename = formatContentFileFilename({
				contentId: contentId,
				fileCategory: contentFileCategoriesMap.OPTIMISED,
				extension: '.avif',
				label: settings.label,
			});

			return convertImage({
				inputPath: filePath,
				outputDir: outputDir,
				outputFilename: outputFilename,
				formatOptions: {
					format: '.avif',
					quality: settings.quality,
				},
				resize: {
					[widthIsLongEdge ? 'width' : 'height']: settings.longEdge,
				},
			})
				.then(() =>
					importNewMediaFile({
						contentId: contentId,
						fileSource: {
							category: contentFileCategoriesMap.OPTIMISED,
							label: settings.label,
							currentFilePath: path.join(
								outputDir,
								outputFilename,
							),
						},
					}),
				)
				.catch((err: unknown) =>
					errorOutcome({
						message:
							'Unexpected error when generating optimised media.',
						caughtException: err,
						context: {
							originalFilePath: filePath,
							contentId: contentId,
						},
					}),
				);
		}),
	);
}

export const createOptimisedFilesForAllImages = async () => {
	const mediaRequiringOptimisation = await db
		.selectFrom('Content')
		.select('id as contentId')
		.where('kind', '=', 'image')
		.execute();

	return sequentialAsync(
		createOptimisedFilesForImage,
		mediaRequiringOptimisation,
		true,
	);
};
