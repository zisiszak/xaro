import { access } from 'fs/promises';
import { extname, join, relative } from 'path';
import { mkdirRecursive, moveFile } from '~/utils/fs.js';
import { type FileExtension } from '../file-format/model.js';

const MAX_FILE_IDS_PER_DIR = 100;

interface FsFile {
	get filesDirectory(): string;
	get tempDirectory(): string;
	generateImportPath(fileID: number, extension: FileExtension): Promise<string>;

	resolveLibraryPath(libraryPath: string): string;
	toLibraryPath(filePath: string): string;

	/** Resolves with the libraryPath */
	moveToLibrary(currentFilePath: string, fileID: number): Promise<string>;
}

export const fsFile: FsFile = {
	get filesDirectory() {
		return join(process.env.ROOT_DIRECTORY, 'files');
	},
	get tempDirectory() {
		return join(process.env.ROOT_DIRECTORY, '.temp');
	},
	async generateImportPath(fileID, ext) {
		const directory = join(
			this.filesDirectory,
			Math.floor(fileID / MAX_FILE_IDS_PER_DIR).toString(),
		);
		await access(directory).catch(() => mkdirRecursive(directory));

		const filename = `${fileID.toString().padStart(7, '0')}` + ext;

		const path = join(directory, filename);

		const exists = await access(path)
			.then(() => true)
			.catch(() => false);
		if (exists) throw 'generated file path already exists...';

		return path;
	},
	async moveToLibrary(currentPath, fileID) {
		const ext = extname(currentPath) as FileExtension;
		const newPath = await this.generateImportPath(fileID, ext);

		await moveFile(currentPath, newPath);

		return this.toLibraryPath(newPath);
	},
	toLibraryPath(filePath) {
		return relative(this.filesDirectory, filePath);
	},
	resolveLibraryPath(libraryPath) {
		return join(this.filesDirectory, libraryPath);
	},
};
