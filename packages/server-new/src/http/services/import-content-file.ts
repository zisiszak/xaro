import { isError, newError, type GenericError } from 'exitus';
import { access } from 'fs/promises';
import path from 'path';
import { xaro } from '~/index.js';
import { type ContentFileRelationshipTag } from '~/models/database/tables/content-files.js';
import { type FileMetadata, type FileSourceTag } from '~/models/database/tables/files.js';
import { ContentFiles, Files } from '~/models/database/tables/index.js';
import { hashFile, mkdirDefaults, moveFile, readFileSize } from '~/utils/index.js';
import { getFileFormatInfo } from '../../models/caches/file-formats.js';
import { resolveContentFileDestination } from './resolve-content-file-destination.js';

interface ImportContentFileProps {
	filePath: string;
	sourceTag: FileSourceTag;
	sourceUrl?: string;
	/** if generated or extracted after being embedded in another file. */
	sourceFileHash?: string;
	metadata?: Partial<FileMetadata>;
	ownerID: number;
	contentID: number;
	relTag: ContentFileRelationshipTag;
}
export async function importContentFile({
	filePath,
	sourceTag,
	sourceUrl,
	sourceFileHash,
	ownerID,
	metadata = {},
	contentID,
	relTag,
}: ImportContentFileProps): Promise<GenericError | number> {
	const fileSize = await readFileSize(filePath);
	if (isError(fileSize))
		return newError({
			message: 'File Import Error [importContentFile] - File could not be found/accessed.',
			context: { fileName: path.basename(filePath) },
			caughtException: fileSize,
		});

	// Format verification
	const { formats, ext } = await getFileFormatInfo(filePath);
	if (formats.length === 0)
		return newError({
			message: 'File Import Error [importContentFile] - File format not supported.',
			context: { fileName: path.basename(filePath) },
		});

	const fullHash = await hashFile(filePath);

	let importedFilePath: string;
	let handleUndoMove: (() => Promise<void>) | null = null;

	const [err, hashMatchedFile] = await Files.checkIsHashInTable({ fullHash, ownerID });
	if (err) {
		return newError({
			message:
				'File Import Error [importContentFile] - Failed to check if matching hash exists in database.',
			caughtException: hashMatchedFile,
			context: { fileName: path.basename(filePath) },
		});
	}

	if (hashMatchedFile.existing) {
		if (hashMatchedFile.userOwnsExisting) {
			return newError({
				message:
					'File Import Error [importContentFile] - Matching file hash found in database.',
				context: {
					fileName: path.basename(filePath),
					existing: hashMatchedFile,
					fullHash,
				},
			});
		}

		importedFilePath = hashMatchedFile.existing.path;
	} else {
		// Move file before adding to database if there's no matching file hash found
		const fileDest = resolveContentFileDestination({ contentID, fullHash, relTag });
		await access(fileDest.dir).catch(() => mkdirDefaults(fileDest.dir));

		const newPath = path.join(fileDest.dir, fileDest.basename + ext);

		const [moveError, undoMove] = await moveFile(filePath, newPath);
		if (moveError) {
			return newError({
				message: 'File Import Error [importContentFile] - Failed to move file to new path.',
				context: { fileName: path.basename(filePath), filePath, newPath },
			});
		}

		importedFilePath = newPath;
		handleUndoMove = async () => {
			const undoMoveErr = await undoMove();
			if (undoMoveErr) xaro.log.error(undoMoveErr);
		};
	}

	const mergedMetadata: FileMetadata = {
		original_filename: path.basename(filePath, ext),
		...metadata,
	};

	return Files.insert({
		owner_id: ownerID,
		full_hash: fullHash,
		size: fileSize,
		metadata: mergedMetadata,
		format_id: formats[0]!.id,
		source_tag: sourceTag,
		source_url: sourceUrl,
		source_file_hash: sourceFileHash,
		path: importedFilePath,
	}).then(async ([err, fileID]) => {
		if (err) {
			handleUndoMove && void handleUndoMove();

			return newError({
				message: 'File Import Error [importContentFile] - Failed to add entry to database.',
				caughtException: err,
				context: {
					fileName: path.basename(filePath),
				},
			});
		}

		const linkingError = await ContentFiles.insert({
			file_id: fileID,
			content_id: contentID,
			rel_tag: relTag,
		});
		if (linkingError) {
			void Files.removeEntryByID(fileID).then(([err]) => {
				if (err) {
					xaro.log.error(err);
				} else {
					handleUndoMove && void handleUndoMove();
				}
			});

			return newError({
				message:
					'File Import Error [importContentFile] - Error linking file and content in database.',
				caughtException: linkingError,
				context: {
					fileName: path.basename(filePath),
					fileID: fileID,
				},
			});
		}

		return fileID;
	});
}
