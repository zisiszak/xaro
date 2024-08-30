import path from 'path';
import { doesPathExist, isDir, readFileSize } from '~/utils/fs.js';
import { hashFile } from '~/utils/hash-file.js';
import { moveFileToFilesDir } from './fs.js';
import { FileRepository, getFileFormatInfo } from './index.js';
import { type FileMetadata, type FileOrigin, type InsertableFileDto } from './model.js';

export interface ImportFileProps {
	filePath: string;
	origin: FileOrigin;
}

export interface ImportFileResult {
	fileID: number;
	duplicate: boolean;
}
export const importFile = async (
	filePath: string,
	origin: FileOrigin,
): Promise<ImportFileResult> => {
	const exists = await doesPathExist(filePath);
	if (!exists) throw 'path does not exist.';

	const isFile = (await isDir(filePath)) === false;
	if (!isFile) throw 'path is a directory.';

	const fileSize = await readFileSize(filePath);
	const fileHash = await hashFile(filePath);

	const filesWithMatchingHash = await FileRepository.findAllByHash('file', fileHash);
	if (filesWithMatchingHash.length !== 0) {
		const existingFile = filesWithMatchingHash.find(
			({ size: existingSize, path }) => fileSize === existingSize && path !== null,
		);
		if (existingFile)
			return {
				fileID: existingFile.id,
				duplicate: true,
			};
	}

	const { formatID, metadata: formatMetadata } = await getFileFormatInfo(filePath);
	const metadata: FileMetadata = { ...formatMetadata, originalFilename: path.basename(filePath) };

	const nullPathInsertion: InsertableFileDto = {
		fileHash,
		size: fileSize,
		formatID,
		path: null,
		origin,
		metadata,
	};

	const fileID = await FileRepository.insert(nullPathInsertion);

	return moveFileToFilesDir(filePath, fileID, fileHash)
		.then(async ({ relativePath, undoMove }) => {
			await FileRepository.updatePathByID(fileID, relativePath).catch(async () => {
				await undoMove();
				throw 'failed to update file entry after file was moved to destination dir.';
			});

			return { fileID, duplicate: false };
		})
		.catch(async () => {
			await FileRepository.removeByID(fileID);
			throw 'failed to move file to destination dir.';
		});
};
