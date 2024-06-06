import { access, rename } from 'fs/promises';
import path from 'path';
import {
	checkContentFileInfoMatchesCategory,
	contentFileCategoriesMap,
	type ContentFileCategory,
} from '../../data/model/shared/content-file-categories.js';
import {
	contentFileExtensionMap,
	getContentFileFilenameInfo,
	videoExtensions,
	type ContentFileExtension,
	type ContentKind,
	type VideoContentFileExtension,
} from '../../data/model/shared/content-kinds.js';
import { type PlatformLinkedContent } from '../../data/model/tables/index.js';
import { config, db, logger } from '../../index.js';
import { ffmpeg } from '../../libs/ffmpeg/index.js';
import {
	type ExtractedImageMetadata,
	type ExtractedVideoMetadata,
} from '../../libs/ffmpeg/types.js';
import { hashFile } from '../../utils/fs/hash-file.js';
import { getFileSize } from '../../utils/fs/index.js';
import { readImageFileDimensions } from '../../utils/media-utils/read-image-file-dimensions.js';
import {
	FS_ERROR,
	errorOutcome,
	isErrorOutcome,
} from '../../utils/outcomes.js';
import { formatContentFileFilename } from './file-management/format-content-filename.js';
import { prepareExtractedFileMetadata } from './file-management/prepare-content-file-metadata.js';
import { resolveContentFileDirectory } from './file-management/resolve-content-directory.js';
import { generateMediaThumbnails } from './generate-content-thumbnails.js';
import { createOptimisedFilesForImage } from './optimisation/create-optimised-files.js';

export type ImportMediaSourceItem = {
	kind: 'file';

	category: ContentFileCategory;

	currentFilePath: string;

	/** SHA-1 */
	hash?: string | null;

	size?: number | null;

	originalFilename?: string | null;

	timestamp?: string | null;

	sourceUrl?: string | null;

	label?: string | null;
};
export type ImportNewMediaFileProps = {
	fileSource: Omit<Extract<ImportMediaSourceItem, { kind: 'file' }>, 'kind'>;
	contentId: number;
};
export const importNewMediaFile = async ({
	fileSource,
	contentId,
}: ImportNewMediaFileProps) => {
	const {
		currentFilePath: filepath,
		originalFilename = null,
		label = null,
		sourceUrl = null,
		category,
		timestamp,
	} = fileSource;
	const { ext, kind } = getContentFileFilenameInfo(filepath);
	if (kind === 'unsupported') {
		return Promise.reject(
			errorOutcome({
				message: 'File kind is not supported.',
				context: {
					fileExtension: ext,
				},
			}),
		);
	}
	if (
		!checkContentFileInfoMatchesCategory({
			category: category,
			contentKind: kind,
		})
	) {
		return Promise.reject(
			errorOutcome({
				message:
					'File is not a valid file type for the selected file category.',
				context: {
					fileKind: kind,
					fileCategory: category,
				},
			}),
		);
	}
	// for some reason typescript compilation throws errors thinking these are somehow still undefined further down :/
	let hash = fileSource.hash as string;
	let size = fileSource.size as number;
	if (!size) {
		size = await getFileSize(filepath);
	}
	if (!hash) {
		hash = await hashFile(filepath);
	}

	const existingFile = await db
		.selectFrom('ContentFile')
		.select(['id', 'linkedContentId'])
		.where('hash', '=', hash)
		.executeTakeFirst();
	if (typeof existingFile !== 'undefined') {
		return Promise.reject(
			errorOutcome({
				message: 'File hash already found in database.',
				context: {
					existingFileId: existingFile.id,
					existingFileLinkedContentId: existingFile.linkedContentId,
					providedMediaId: contentId,
				},
			}),
		);
	}

	let extractedFileMetadata:
		| ExtractedImageMetadata
		| ExtractedVideoMetadata
		| null = null;
	if (kind === 'image') {
		extractedFileMetadata = readImageFileDimensions(filepath);
	} else if (kind === 'video') {
		extractedFileMetadata = await ffmpeg
			.readMetadata(filepath)
			.catch(() => null);
	}

	const preparedFileMetadata = prepareExtractedFileMetadata(
		kind,
		extractedFileMetadata,
	);
	const resolvedImportDirectory = await resolveContentFileDirectory({
		contentId: contentId,
		contentFileCategory: category,
	});
	const formattedFilename = formatContentFileFilename({
		contentId: contentId,
		fileCategory: category,
		extension: ext,
		label: label,
	});

	const importPath = path.join(resolvedImportDirectory, formattedFilename);
	const mediaDirRelativeImportPath = path.relative(
		config.mediaDir,
		importPath,
	);

	let result = Promise.resolve();

	if (importPath !== filepath) {
		if (
			await access(importPath)
				.then(() => true)
				.catch(() => false)
		) {
			return Promise.reject(
				errorOutcome({
					context: {
						resolvedImportPath: importPath,
					},
					message: 'File already exists for resolved pathname.',
				}),
			);
		} else {
			result = result.then(() =>
				rename(filepath, importPath).catch((err) =>
					Promise.reject(
						errorOutcome(FS_ERROR, {
							message: 'Failed to move file to new location',
							context: {
								oldPath: filepath,
								newPath: importPath,
							},
							caughtException: err,
						}),
					),
				),
			);
		}
	}

	return result
		.then(() =>
			db
				.insertInto('ContentFile')
				.values({
					linkedContentId: contentId,
					category: category,
					path: mediaDirRelativeImportPath,
					label,
					originalFilename,
					sourceUrl,
					hash: hash,
					timestamp,
					extension: ext,
					size: size,
					...preparedFileMetadata,
				})
				.executeTakeFirstOrThrow()
				.then((result) => Number(result.insertId!)),
		)
		.catch((err) =>
			Promise.reject(
				isErrorOutcome(err)
					? err
					: errorOutcome({
							message: 'Unexpected error.',
							context: {
								filePath: filepath,
								mediaId: contentId,
							},
						}),
			),
		);
};

export interface ContentImportOptions {
	generateDefaultThumbnails?: boolean;
	createOptimisedMedia?: boolean;
}

export type ImportContentPlatformMetadataProps = Omit<
	PlatformLinkedContent.Insertion,
	'linkedContentId'
>;

export interface ImportNewContentProps {
	/** userId of the user importing the media, whether through an upload or extractor. */
	userId: number;

	// TODO: Fix these types to not include category properties since they are already categories within the sources object
	sources: {
		main: ImportMediaSourceItem;
		originalThumbnail?: ImportMediaSourceItem;
	};

	metadata: {
		platform?: ImportContentPlatformMetadataProps | null;
		user?: {
			customTitle?: string | null;
			customDescription?: string | null;
		};
	};

	options?: ContentImportOptions;
}
export const importContent = async ({
	userId,
	sources: { main, originalThumbnail },
	metadata: { platform: platformMetadata, user: userMetadata = {} },
	options: {
		generateDefaultThumbnails = false,
		createOptimisedMedia = true,
	} = {},
}: ImportNewContentProps) => {
	if (main.kind !== 'file') {
		return Promise.reject(
			errorOutcome(
				{
					message:
						"originalMedia.kind currently only supports 'file' kinds",
					context: {
						originalMedia: main,
						userId,
					},
				},
				{
					stack: false,
				},
			),
		);
	}

	const contentKind = contentFileExtensionMap[
		path.extname(main.currentFilePath) as ContentFileExtension
	] as ContentKind | undefined;
	if (!contentKind) {
		return Promise.reject(
			errorOutcome(
				{
					message: 'Original Media is not of a supported kind.',
				},
				logger.error,
				{
					stack: false,
				},
			),
		);
	}

	let contentId: number;
	return await db
		.insertInto('Content')
		.values({
			kind: contentKind,
		})
		.executeTakeFirstOrThrow()
		.then(({ insertId }) => {
			contentId = Number(insertId);
			return importNewMediaFile({
				contentId: contentId,
				fileSource: {
					...main,
					category: contentFileCategoriesMap.ORIGINAL,
				},
			});
		})
		.then(() =>
			// TODO: make a separate function for this.
			db
				.insertInto('UserLinkedContent')
				.values({
					linkedContentId: contentId,
					linkedUserId: userId,
					customTitle: userMetadata.customTitle,
					customDescription: userMetadata.customDescription,
				})
				.executeTakeFirst(),
		)
		.then(async () => {
			if (platformMetadata) {
				// TODO: make a separate function for this.
				const outcome = await db
					.insertInto('PlatformLinkedContent')
					.values({ ...platformMetadata, linkedContentId: contentId })
					.executeTakeFirst()
					.catch((err: unknown) =>
						errorOutcome(
							{
								message:
									'Failed to add PlatformLinkedMedia data to new import.',
								context: {
									platformMetadata,
									mediaId: contentId,
									userId,
								},
								caughtException: err,
							},
							logger.error,
						),
					);
				if (isErrorOutcome(outcome)) {
					return Promise.reject(outcome);
				}
			}
		})
		.then(async () => {
			if (originalThumbnail) {
				await importNewMediaFile({
					contentId: contentId,
					fileSource: {
						...originalThumbnail,
						category: contentFileCategoriesMap.THUMB_ORIGINAL,
					},
				}).catch((err) => {
					errorOutcome(
						{
							message: 'Failed to import original thumbnail',
							caughtException: err,
							context: {
								originalThumbnail,
								mediaId: contentId,
								userId,
							},
						},
						logger.error,
					);
				});
			}

			// TODO: make a separate function for this
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const ext = path.extname(main.currentFilePath);
			if (
				generateDefaultThumbnails &&
				(videoExtensions.includes(ext as VideoContentFileExtension) ||
					ext === '.gif')
			) {
				await generateMediaThumbnails({ mediaId: contentId }).catch(
					(err) => {
						logger.error(err);

						if (isErrorOutcome(err)) {
							return;
						}
						errorOutcome(
							{
								caughtException: err,
							},
							logger.error,
						);
					},
				);
			}
			if (createOptimisedMedia) {
				await createOptimisedFilesForImage({
					contentId: contentId,
				}).catch((err) => {
					if (isErrorOutcome(err)) {
						return;
					}
					errorOutcome(
						{
							caughtException: err,
						},
						logger.error,
					);
				});
			}

			return contentId;
		});
};
