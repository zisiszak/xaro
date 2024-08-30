import path from 'path';
import { xaro } from '~/index.js';
import { moveFile } from '~/utils/fs.js';

const maxUniqueIdsPerDir = 100;

const filesDir = path.join(xaro.config.rootDir, 'files');

export const resolveFileDestination = (
	fileID: number,
	fullHash: string,
): {
	dir: string;
	basename: string;
} => ({
	dir: path.join(filesDir, Math.floor(fileID / maxUniqueIdsPerDir).toString()),
	basename: `${fileID.toString().padStart(7, '0')}-${fullHash}`,
});

export const relativeToFilesDir = (filePath: string): string => path.relative(filesDir, filePath);

export const moveFileToFilesDir = async (
	currentFilePath: string,
	fileID: number,
	fileHash: string,
): Promise<{ relativePath: string; undoMove: () => Promise<void> }> => {
	const fileDestination = resolveFileDestination(fileID, fileHash);
	const destinationPath = path.join(
		fileDestination.dir,
		fileDestination.basename + path.extname(currentFilePath),
	);

	await moveFile(currentFilePath, destinationPath);

	return {
		relativePath: relativeToFilesDir(destinationPath),
		undoMove: async () => moveFile(destinationPath, currentFilePath),
	};
};
