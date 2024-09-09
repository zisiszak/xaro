import { exerr, type Exerr } from 'exitus';
import { type Selectable } from 'kysely';
import { join } from 'path';
import { logger } from '~/index.js';
import { readImageFileFormatMetadata } from '~/modules/file-format/helpers.js';
import { FileFormatCategoryEnum, type FileFormatCategory } from '~/modules/file-format/model.js';
import {
	convertImage,
	ffmpeg,
	mkdirRecursive,
	sequentialAsync,
	type ImageOutputFormat,
} from '~/utils/index.js';
import { fileFormatRepository } from '../file-format/sqlite.repository.js';
import { type FileToMediaLabel, type FileToMediaRelationship } from '../file-to-media/model.js';
import { fileToMediaRepository } from '../file-to-media/sqlite.repository.js';
import { userToFileRepository } from '../user-to-file/sqlite.repository.js';
import { fsFile } from './fs-file.js';
import { type FileMetadata } from './model.js';
import { optimisedImagePresets, type OptimisedImagePreset } from './optimised/presets.image.js';
import { fileRepository } from './sqlite.repository.js';
import { type FileTableSchema } from './sqlite.table.js';
import { defaultThumbnailPreset } from './thumbnails/presets.js';

// type UpdateKind = 'optimised';

export class OriginalFile {
	// static #idToInstanceMap: Map<number, OriginalFile> = new Map();
	// static #idToUpdatesRequired: Map<number, Set<UpdateKind>> = new Map();
	// static #instanceToUpdatePromises: WeakMap<OriginalFile, Map<UpdateKind, Promise<void>>> =
	// 	new WeakMap();
	// static #setUpdateRequired(id: number, update: UpdateKind): void {
	// 	const updates = this.#idToUpdatesRequired.get(id) ?? new Set();
	// 	updates.add(update);
	// 	this.#idToUpdatesRequired.set(id, updates);
	// }
	// static async #updateInstanceIfRequired(instance: OriginalFile, update: UpdateKind) {
	// 	const updatesRequired = this.#idToUpdatesRequired.get(instance.#fileID);
	// 	if (!updatesRequired) return;
	// 	if (updatesRequired.size === 0) {
	// 		this.#idToUpdatesRequired.delete(instance.#fileID);
	// 		return;
	// 	}
	// 	if (!updatesRequired.has(update)) return;

	// 	let updatePromises = this.#instanceToUpdatePromises.get(instance);
	// 	if (!updatePromises) {
	// 		updatePromises = new Map();
	// 		this.#instanceToUpdatePromises.set(instance, updatePromises);
	// 	}

	// 	const updateCallback = update === 'optimised' ? ('#updateOptimised' as const) : undefined;

	// 	if (updatePromises.has(update)) {
	// 		const promise = await updatePromises.get(update)!.then(() => {
	// 			updatesRequired.add(update);
	// 		});
	// 	}
	// }

	// static #getUpdateRequired(id: number, update: UpdateKind): boolean | Promise<void> {
	// 	const updates = this.#idToUpdatesRequired.get(id);
	// 	if (!updates) return false;
	// 	return updates[update] ?? false;
	// }
	// static #clearCache(count?: number) {}
	// static #cacheInstance(originalFile: OriginalFile) {
	// 	this.#idToInstanceMap.set(originalFile.fileID, originalFile);
	// }
	// static #getCachedInstance(id: number) {
	// 	return this.#idToInstanceMap.get(id);
	// }

	readonly #fileID: number;
	get fileID() {
		return this.#fileID;
	}

	readonly #formatID: number;
	get formatID() {
		return this.#formatID;
	}

	readonly #formatCategory: number;
	get formatCategory() {
		return this.#formatCategory;
	}

	readonly #filePath: string;

	readonly #libraryPath: string;
	get libraryPath() {
		return this.#libraryPath;
	}

	#dateTrashed: number | null;
	get dateTrashed() {
		return this.#dateTrashed;
	}
	async trash(): Promise<void> {
		this.#dateTrashed = await fileRepository.trash(this.#fileID);
		logger.info(
			{
				fileID: this.#fileID,
				dateTrashed: this.#dateTrashed,
			},
			'File trashed.',
		);
	}
	async untrash(): Promise<void> {
		await fileRepository.untrash(this.#fileID);
		this.#dateTrashed = null;
		logger.info(
			{
				fileID: this.#fileID,
			},
			'File untrashed.',
		);
	}

	readonly #metadata: FileMetadata;
	get fileMetadata() {
		return this.#metadata;
	}

	#optimisedRequiresUpdate: boolean = true;
	#optimisedUpdatePromise: Promise<void> | null = null;
	#optimisedFiles: readonly Selectable<FileTableSchema>[] = Object.freeze([]);
	async getOptimisedFiles(): Promise<readonly Selectable<FileTableSchema>[]> {
		await this.#updateOptimisedIfRequired();
		return this.#optimisedFiles;
	}
	#optimisedLabelToIDMap: Readonly<Map<string, number>> = Object.freeze(new Map());
	async getOptimisedLabelToIDMap(): Promise<Readonly<Map<string, number>>> {
		await this.#updateOptimisedIfRequired();
		return this.#optimisedLabelToIDMap;
	}

	async #updateOptimisedIfRequired() {
		if (this.#optimisedUpdatePromise) {
			await this.#optimisedUpdatePromise;
		} else if (this.#optimisedRequiresUpdate) {
			await this.#updateOptimised();
		}
	}

	#updateOptimised(): Promise<void> {
		this.#optimisedUpdatePromise = fileRepository
			.findAllOptimisedForOriginalFile(this.#fileID)
			.then((optimisedFiles) => {
				const labelToIDMap = new Map<string, number>();
				optimisedFiles.forEach((file) => {
					labelToIDMap.set(file.label, file.id);
				});

				this.#optimisedFiles = Object.freeze(optimisedFiles);
				this.#optimisedLabelToIDMap = Object.freeze(labelToIDMap);

				this.#optimisedUpdatePromise = null;
				this.#optimisedRequiresUpdate = false;
			});

		return this.#optimisedUpdatePromise;
	}

	async #generateOptimisedImage({
		label,
		resize,
		formatOptions,
	}: OptimisedImagePreset<ImageOutputFormat>): Promise<number> {
		const existingOptimisedID = (await this.getOptimisedLabelToIDMap()).get(label);
		if (typeof existingOptimisedID === 'number') return existingOptimisedID;

		const outputDir = join(fsFile.tempDirectory, 'optimised');
		await mkdirRecursive(outputDir);

		const outputFileName = this.#fileID + label;

		const { outputFilePath } = await convertImage({
			formatOptions,
			inputPath: this.#filePath,
			outputDir: outputDir,
			outputFilename: outputFileName,
			resize,
		});

		logger.info(
			{
				label,
				originalFileID: this.#fileID,
			},
			'Optimised image generated.',
		);

		const { fileID } = await fileRepository.save({
			filePath: outputFilePath,
			kind: 'optimised',
			label: label,
			originalFileID: this.#fileID,
		});

		this.#optimisedRequiresUpdate = true;
		return fileID;
	}

	async generateOptimisedFiles(): Promise<number[]> {
		let result: number[] = [];

		switch (this.#formatCategory) {
			case FileFormatCategoryEnum.Image:
				let originalLongestEdge: number;
				if (this.#metadata.height && this.#metadata.width) {
					originalLongestEdge = Math.max(this.#metadata.height, this.#metadata.width);
				} else {
					logger.warn(
						{
							fileID: this.#fileID,
						},
						'No dimension metadata found for image File.',
					);
					const { width, height } = readImageFileFormatMetadata(this.#filePath);
					if (!width || !height)
						throw exerr({
							message: 'Dimensions could not be read for file.',
							context: {
								fileID: this.#fileID,
							},
						});
					originalLongestEdge = Math.max(width, height);
				}

				const optimisationPresetsApplicable = optimisedImagePresets.filter(({ resize }) =>
					typeof resize === 'number' ? resize < originalLongestEdge : true,
				);

				result = await sequentialAsync(
					async (preset) => this.#generateOptimisedImage(preset),
					optimisationPresetsApplicable,
					false,
				);
				break;

			case FileFormatCategoryEnum.Video:
				break;
			default:
				break;
		}

		logger.info(
			{ fileID: this.#fileID },
			'All optimised files have been generated for original file.',
		);

		this.#optimisedRequiresUpdate = true;
		return result;
	}

	/** Creates a new thumbnail OriginalFile */
	async generateDefaultThumbnail(): Promise<{ fileID: number; isDuplicate: boolean }> {
		if (
			this.#formatCategory !== FileFormatCategoryEnum.Video &&
			!(await fileFormatRepository.findByID(this.#formatID))!.extensions.includes('.gif')
		)
			throw 'Original file cannot be used to generate thumbnails.';

		const outputDir = join(fsFile.tempDirectory, 'optimised');
		await mkdirRecursive(outputDir);

		const { filepath: outputFilePath } = (
			await ffmpeg.generateThumbnails({
				filePath: this.#filePath,
				outputDir,
				// TODO: fix this
				thumbnails: [
					{
						label: defaultThumbnailPreset.label,
						width: defaultThumbnailPreset.longEdge,
					},
				],
			})
		)[0]!;

		logger.info('Default thumbnail generated.', { referenceFileID: this.#fileID });

		return OriginalFile.importOriginalFile(outputFilePath, {
			generatedFromFileID: this.#fileID,
			label: defaultThumbnailPreset.label,
		});
	}

	constructor(data: {
		id: number;
		formatID: number;
		formatCategory: FileFormatCategory;
		libraryPath: string;
		dateTrashed: number | null;
		metadata: FileMetadata;
	}) {
		this.#fileID = data.id;
		this.#formatID = data.formatID;
		this.#formatCategory = data.formatCategory;
		this.#libraryPath = data.libraryPath;
		this.#dateTrashed = data.dateTrashed;
		this.#filePath = fsFile.resolveLibraryPath(this.#libraryPath);
		this.#metadata = data.metadata;

		return this;
	}

	static async linkToUser(fileID: number, userID: number) {
		const originalFileID = await fileRepository.resolveOriginalFileID(fileID);
		await userToFileRepository.save(userID, originalFileID);
		logger.info({ fileID: originalFileID, userID }, 'Original File linked to User.');
	}

	static async linkToMedia(
		fileID: number,
		mediaID: number,
		relationship: FileToMediaRelationship,
		/** only required when multiple links of the same relationship exist. Must be unique per `originalFileID`, `mediaID` and `relationship` link */
		label: FileToMediaLabel | null = null,
	): Promise<undefined | Exerr<'existing_link'>> {
		const originalFileID = await fileRepository.resolveOriginalFileID(fileID);

		const existingLink = await fileToMediaRepository.find(
			originalFileID,
			mediaID,
			relationship,
			label,
		);
		if (existingLink) return exerr({ code: 'existing_link' });

		await fileToMediaRepository.save(originalFileID, mediaID, relationship, label);

		logger.info(
			{
				mediaID,
				originalFileID,
				fileID,
				relationship,
				label,
			},
			'Original File linked to Media.',
		);
	}

	static async importOriginalFile(
		filePath: string,
		{
			originalFileName,
			generatedFromFileID,
			label,
		}: {
			originalFileName?: string | null;
			generatedFromFileID?: number | null;
			label?: string | null;
		},
	): Promise<{ fileID: number; isDuplicate: boolean }> {
		const { fileID, isDuplicate } = await fileRepository.save({
			filePath: filePath,
			kind: 'original',
			generatedFromFileID: generatedFromFileID,
			label: label,
			metadata: {
				originalFilename: originalFileName,
			},
		});
		if (isDuplicate) {
			logger.info(
				{
					fileID,
				},
				`Original File already exists. No import required.`,
			);
		} else {
			logger.info({ fileID }, 'Original File imported.');
		}

		return { fileID, isDuplicate };
	}

	static async fromOriginalFileID(originalFileID: number): Promise<OriginalFile> {
		const file = await fileRepository.findByID(originalFileID);
		if (!file) throw 'File id not found.';
		if (file.originalFileID !== null || file.kind !== 'original')
			throw 'File id is not for an original file.';

		const formatCategory = await fileFormatRepository.resolveFormatCategory(file.formatID);

		const originalFile = new OriginalFile({
			id: file.id,
			formatID: file.formatID,
			formatCategory,
			libraryPath: file.libraryPath,
			dateTrashed: file.dateTrashed,
			metadata: file.metadata,
		});

		return originalFile;
	}
}

// interface OriginalFileManager {
// 	readonly fileID: number;
// 	readonly formatID: number;
// 	readonly formatCategory: FileFormatCategory;
// 	readonly fileLibraryPath: string;

// 	originalFile: TableSelection<'File'>;
// 	optimisedFiles: TableSelection<'File'>[];
// 	generateOptimisedFiles: () => Promise<number>;
// }

// export const newOriginalFileManager = async (
// 	originalFileID: number,
// ): Promise<OriginalFileManager> => {
// 	const originalFile = await fileRepository.findByID(originalFileID);
// 	if (!originalFile) throw exerr({ code: 'file_not_found' });
// 	if (originalFile.originalFileID !== null || originalFile.kind !== 'original')
// 		throw exerr({ code: 'file_not_original' });
// 	if (originalFile.libraryPath === null) throw exerr({ code: 'file_missing_library_path' });

// 	// originalFile.

// 	const manager: OriginalFileManager = {
// 		fileID: originalFile.id,
// 		formatID: originalFile.formatID,
// 		formatCategory: await fileFormatRepository.resolveFormatCategory(originalFile.formatID),
// 		fileLibraryPath: originalFile.libraryPath,
// 	};
// };
