import { access } from 'fs/promises';
import path, { extname, join, relative } from 'path';
import { xaro } from '~/index.js';
import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import {
	findAllByColumn,
	findByColumn,
	findByID,
	insert,
	insertRowOnConflictDoNothing,
} from '~/shared/index.js';
import { doesPathExist, isDir, mkdirRecursive, moveFile, readFileSize } from '~/utils/fs.js';
import { hashFile } from '~/utils/hash-file.js';
import { getFileFormatInfo } from '../helpers/get-file-format-info.js';
import { type FileExtension } from '../models/file-format.model.js';
import { type FileMetadata, type OriginalFileToMediaRelationship } from '../models/file.model.js';

const MAX_FSFILE_IDS_PER_DIR = 100;

type FsFileSelection = TableSelection<'File'>;
type FsFileInsertion = TableInsertion<'File'>;

interface FileFS {
	get filesDirectory(): string;
	generateImportPath(fsFileID: number, extension: FileExtension): Promise<string>;

	resolveLibraryPath(libraryPath: string): string;
	toLibraryPath(filePath: string): string;

	/** Resolves with the libraryPath */
	moveToLibrary(currentFilePath: string, fsFileID: number): Promise<string>;
}

const fileFS: FileFS = {
	get filesDirectory() {
		return join(process.env.ROOT_DIRECTORY, 'files');
	},
	async generateImportPath(fsFileID) {
		const directory = join(
			this.filesDirectory,
			Math.floor(fsFileID / MAX_FSFILE_IDS_PER_DIR).toString(),
		);
		await access(directory).catch(() => mkdirRecursive(directory));

		const filename = `${fsFileID.toString().padStart(7, '0')}`;

		const path = join(directory, filename);

		const exists = await access(path)
			.then(() => true)
			.catch(() => false);
		if (exists) throw 'generated file path already exists...';

		return path;
	},
	async moveToLibrary(currentPath, fsFileID) {
		const ext = extname(currentPath) as FileExtension;
		const newPath = await this.generateImportPath(fsFileID, ext);

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

export interface FileRepository {
	findByID(fsFileID: number): Promise<FsFileSelection | undefined>;
	findByLibraryPath(libraryPath: string): Promise<FsFileSelection | undefined>;
	findAllByHash(kind: 'file' | 'data', hash: string): Promise<FsFileSelection[]>;

	resolveOriginalFileID(fsFileID: number): Promise<number>;
	linkMediaToOriginal(
		fsFileID: number,
		mediaID: number,
		relationship: OriginalFileToMediaRelationship,
	): Promise<undefined>;

	/** moves file to into library */
	save(
		currentFilePath: string,
		kind: 'original' | 'optimised',
	): Promise<{ fileID: number; isDuplicate: boolean }>;
}

export const fileRepository: FileRepository = {
	async findByID(fsFileID) {
		return findByID('File', fsFileID);
	},
	async findAllByHash(kind, hash) {
		return findAllByColumn('File', kind === 'data' ? 'dataHash' : 'fileHash', hash);
	},
	async findByLibraryPath(libraryPath) {
		return findByColumn('File', 'libraryPath', libraryPath);
	},

	async save(currentFilePath, kind: 'original' | 'optimised') {
		const exists = await doesPathExist(currentFilePath);
		if (!exists) throw 'path does not exist or cannot be accessed.';

		const isFile = (await isDir(currentFilePath)) === false;
		if (!isFile) throw 'path is a directory.';

		const size = await readFileSize(currentFilePath);
		const fileHash = await hashFile(currentFilePath);

		const filesWithMatchingHash = await this.findAllByHash('file', fileHash);
		if (filesWithMatchingHash.length !== 0) {
			const existingFile = filesWithMatchingHash.find(
				({ size: existingSize, libraryPath: existingLibraryPath }) =>
					size === existingSize && existingLibraryPath !== null,
			);
			if (existingFile) return { fileID: existingFile.id, isDuplicate: true };
		}

		const { formatID, metadata: formatMetadata } = await getFileFormatInfo(currentFilePath);
		const metadata: FileMetadata = {
			...formatMetadata,
			originalFilename: path.basename(currentFilePath),
		};

		const nullPathInsertion: FsFileInsertion = {
			fileHash,
			size,
			formatID,
			libraryPath: null,
			kind,
			metadata: JSON.stringify(metadata),
		};

		const fileID = await insert('File', nullPathInsertion);

		return fileFS
			.moveToLibrary(currentFilePath, fileID)
			.then(async (libraryPath) => {
				const oldFilePath = currentFilePath;
				await xaro.db
					.updateTable('File')
					.set({ libraryPath })
					.where('id', '=', fileID)
					.execute()
					.catch(async (err) => {
						console.error(err);
						await moveFile(fileFS.resolveLibraryPath(libraryPath), oldFilePath);
						throw 'failed to update FsFile entry after file was moved to destination dir.';
					});

				return { fileID, isDuplicate: false };
			})
			.catch(async () => {
				await xaro.db.deleteFrom('File').where('id', '=', fileID).execute();
				throw 'failed to move file to destination dir.';
			});
	},

	async resolveOriginalFileID(fsFileID) {
		const file = await this.findByID(fsFileID);
		if (!file) throw 'file does not exist';

		const originalFileID = file.kind === 'original' ? file.id : file.originalFileID!;
		return originalFileID;
	},

	async linkMediaToOriginal(fsFileID, mediaID, relationship) {
		const originalFileID = await this.resolveOriginalFileID(fsFileID);

		return insertRowOnConflictDoNothing('FileToMedia', {
			fileID: originalFileID,
			mediaID,
			relationship,
		});
	},
};