import { access, rename, rm } from 'fs/promises';
import path from 'path';
import { contentFileCategoriesMap } from '~/data/model/shared/content-file-categories.js';
import { trueBasename } from '~/utils/fs/index.js';
import { errorOutcome } from '~/utils/outcomes.js';
import { type ContentFile } from '../../../data/model/tables/index.js';
import { config, db } from '../../../index.js';
import { convertImage } from '../../../libs/sharp/convert-image.js';
import { sequentialAsync } from '../../../utils/async/sequential-async.js';
import { hashFile } from '../../../utils/fs/hash-file.js';

export const optimiseGeneratedThumbnail = async (
	contentFile: ContentFile.Selection,
) => {
	if (contentFile.category !== contentFileCategoriesMap.THUMB_GENERATED) {
		return Promise.reject(
			errorOutcome({
				message:
					'Content file provided is not of the correct category.',
				context: {
					inputFileCategory: contentFile.category,
					expectedFileCategory:
						contentFileCategoriesMap.THUMB_GENERATED,
				},
			}),
		);
	}

	if (contentFile.extension === '.avif') {
		return;
	}

	const filePath = path.join(config.mediaDir, contentFile.path);

	const fileExists = await access(filePath).catch(() => false);
	if (fileExists === false) {
		return Promise.reject(
			errorOutcome({
				message: 'File not found.',
				context: {
					filePath: filePath,
				},
			}),
		);
	}

	const originalFilename = trueBasename(contentFile.path);
	const tempFilename = `.temp_${originalFilename}`;
	const tempDir = config.awaitingImportDir;

	return convertImage({
		inputPath: filePath,
		outputDir: tempDir,
		outputFilename: tempFilename,
		formatOptions: {
			format: '.avif',
			quality: 75,
		},
	}).then(async (res) => {
		const generatedThumbFilepath = path.join(
			tempDir,
			tempFilename + '.avif',
		);
		const context = {
			inputFilePath: filePath,
			generatedThumbFilePath: generatedThumbFilepath,
		};

		return rm(
			path.join(
				path.dirname(filePath),
				trueBasename(filePath) + contentFile.extension,
			),
		)
			.catch((err) =>
				Promise.reject(
					errorOutcome({
						caughtException: err,
						message:
							'Failed to remove existing unoptimised thumbnail file.',
						context,
					}),
				),
			)
			.then(() =>
				rename(
					path.join(tempDir, tempFilename + '.avif'),
					filePath,
				).catch((err) =>
					Promise.reject(
						errorOutcome({
							message:
								'Failed to rename generated thumbnail file.',
							context,
							caughtException: err,
						}),
					),
				),
			)
			.then(() => hashFile(filePath))
			.then((hash) =>
				db
					.updateTable('ContentFile')
					.set({
						extension: '.avif',
						hash: hash,
						size: res.size,
					})
					.where('id', '=', contentFile.id)
					.executeTakeFirst()
					.then(() => undefined)
					.catch((err) =>
						Promise.reject(
							errorOutcome({
								message:
									'Failed to update ContentFile table with generated thumbnail details',
								context,
								caughtException: err,
							}),
						),
					),
			);
	});
}

export const optimiseAllGeneratedThumbnails = async () => {
	const thumbsRequiringOptimisation = await db
		.selectFrom('ContentFile')
		.selectAll()
		.where((eb) =>
			eb.and([
				eb('category', '=', contentFileCategoriesMap.THUMB_GENERATED),
				eb('extension', '!=', '.avif'),
			]),
		)
		.execute();

	if (thumbsRequiringOptimisation.length === 0) {
		return;
	}

	return sequentialAsync(
		optimiseGeneratedThumbnail,
		thumbsRequiringOptimisation,
		true,
	);
}
