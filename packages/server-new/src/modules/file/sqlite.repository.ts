import { basename } from 'path';
import { database } from '~/index.js';
import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { insert, unixEpochNow } from '~/shared/index.js';
import { doesPathExist, isDir, moveFile, readFileSize } from '~/utils/fs.js';
import { hashFile } from '~/utils/hash-file.js';
import { readFileFormatInfo } from '../file-format/helpers.js';
import { fsFile } from './fs-file.js';
import { type FileMetadata } from './model.js';

type FileSelection = TableSelection<'File'>;
type FileInsertion = TableInsertion<'File'>;

interface OriginalFileSaveData {
	kind: 'original';
	filePath: string;
	generatedFromFileID?: number | null;
	label?: string | null;
	metadata?: {
		originalFilename?: string | null;
	};
}
interface OptimisedFileSaveData {
	kind: 'optimised';
	filePath: string;
	originalFileID: number;
	generatedFromFileID?: number | null;
	label: string;
}

export interface FileRepository {
	/** moves file to into library */
	save(
		data: OriginalFileSaveData | OptimisedFileSaveData,
	): Promise<{ fileID: number; isDuplicate: boolean }>;

	findByID(fileID: number): Promise<(FileSelection & { libraryPath: string }) | undefined>;

	findByLibraryPath(
		libraryPath: string,
	): Promise<(FileSelection & { libraryPath: string }) | undefined>;

	findAllByHash(
		kind: 'file' | 'data',
		hash: string,
	): Promise<(FileSelection & { libraryPath: string })[]>;

	findAllOptimisedForOriginalFile(originalFileID: number): Promise<
		(FileSelection & {
			label: string;
			kind: 'optimised';
			originalFileID: number;
		})[]
	>;

	resolveOriginalFileID(fileID: number): Promise<number>;

	resolveOriginalFileIDFromLibraryPath(libraryPath: string): Promise<number>;

	resolveLibraryPathFromID(fileID: number): Promise<string>;

	/** Marks the file as trashed if it isn't already. Returns the current `dateTrashed` */
	trash(fileID: number): Promise<number>;

	/** Marks the file as not trashed if it isn't already. Returns null */
	untrash(fileID: number): Promise<void>;
}

export const fileRepository: FileRepository = {
	async findByID(fileID) {
		return database
			.selectFrom('File')
			.selectAll()
			.where((eb) => eb.and([eb('id', '=', fileID), eb('libraryPath', 'is not', null)]))
			.$narrowType<{ libraryPath: string }>()
			.executeTakeFirst();
	},
	async findAllByHash(kind, hash) {
		return database
			.selectFrom('File')
			.selectAll()
			.where((eb) =>
				eb.and([
					eb(kind === 'data' ? 'dataHash' : 'fileHash', '=', hash),
					eb('libraryPath', 'is not', null),
				]),
			)
			.$narrowType<{ libraryPath: string }>()
			.execute();
	},
	async findByLibraryPath(libraryPath) {
		return database
			.selectFrom('File')
			.selectAll()
			.where('libraryPath', '=', libraryPath)
			.$narrowType<{ libraryPath: string }>()
			.executeTakeFirst();
	},
	async findAllOptimisedForOriginalFile(originalFileID) {
		return database
			.selectFrom('File')
			.selectAll()
			.where((eb) =>
				eb.and([
					eb('originalFileID', '=', originalFileID),
					eb('kind', '=', 'optimised'),
					eb('label', 'is not', null),
				]),
			)
			.$narrowType<{
				label: string;
				kind: 'optimised';
				originalFileID: number;
			}>()
			.execute();
	},

	// TODO: Make this save data normally.
	async save(data) {
		const { filePath, kind, generatedFromFileID, label } = data;

		const exists = await doesPathExist(filePath);
		if (!exists) throw 'path does not exist or cannot be accessed.';

		const isFile = (await isDir(filePath)) === false;
		if (!isFile) throw 'path is a directory.';

		const size = await readFileSize(filePath);
		const fileHash = await hashFile(filePath);

		const filesWithMatchingHash = await this.findAllByHash('file', fileHash);
		if (filesWithMatchingHash.length !== 0) {
			const existingFile = filesWithMatchingHash.find(
				({ size: existingSize, libraryPath: existingLibraryPath }) =>
					size === existingSize && existingLibraryPath !== null,
			);
			if (existingFile) return { fileID: existingFile.id, isDuplicate: true };
		}

		const { formatID, metadata: formatMetadata } = await readFileFormatInfo(filePath);
		const metadata: FileMetadata = {
			...formatMetadata,
			// originalFilename:
			// originalFilename === null ? null : (originalFilename ?? path.basename(filePath)),
		};

		if (kind === 'original') {
			metadata.originalFilename = data.metadata?.originalFilename ?? basename(filePath);
		}

		const nullPathInsertion: FileInsertion = {
			fileHash,
			size,
			formatID,
			libraryPath: null,
			kind,
			label,
			generatedFromFileID,
			metadata: JSON.stringify(metadata),
		};

		if (kind === 'optimised') {
			nullPathInsertion.originalFileID = data.originalFileID;
		}

		const fileID = await insert('File', nullPathInsertion);
		return fsFile
			.moveToLibrary(filePath, fileID)
			.then(async (libraryPath) => {
				const oldFilePath = filePath;
				await database
					.updateTable('File')
					.set({ libraryPath })
					.where('id', '=', fileID)
					.execute()
					.catch(async (err) => {
						console.error(err);
						await moveFile(fsFile.resolveLibraryPath(libraryPath), oldFilePath);
						throw 'failed to update FsFile entry after file was moved to destination dir.';
					});

				return { fileID, isDuplicate: false };
			})
			.catch(async () => {
				await database.deleteFrom('File').where('id', '=', fileID).execute();
				throw 'failed to move file to destination dir.';
			});
	},

	async resolveOriginalFileID(fileID) {
		const file = await this.findByID(fileID);
		if (!file) return Promise.reject(`file row with id: '${fileID}' not found.`);

		const originalFileID = file.kind === 'original' ? file.id : file.originalFileID!;
		return originalFileID;
	},

	async resolveOriginalFileIDFromLibraryPath(libraryPath) {
		const file = await this.findByLibraryPath(libraryPath);
		if (!file) throw `file row with libraryPath: ${libraryPath} not found`;

		const originalFileID = file.kind === 'original' ? file.id : file.originalFileID!;
		return originalFileID;
	},
	async resolveLibraryPathFromID(fileID) {
		return (
			await database
				.selectFrom('File')
				.select('libraryPath')
				.where((eb) => eb.and([eb('id', '=', fileID), eb('libraryPath', 'is not', null)]))
				.executeTakeFirstOrThrow()
		).libraryPath!;
	},

	async trash(fileID) {
		const getDateTrashedQuery = database
			.selectFrom('File')
			.select('dateTrashed')
			.where('id', '=', fileID);

		const { dateTrashed: dateTrashedAlready } =
			await getDateTrashedQuery.executeTakeFirstOrThrow();

		if (dateTrashedAlready !== null) return dateTrashedAlready;
		await database
			.updateTable('File')
			.set('dateTrashed', unixEpochNow as unknown as number)
			.where('id', '=', fileID)
			.limit(1)
			.executeTakeFirst();

		return (await getDateTrashedQuery.executeTakeFirstOrThrow()).dateTrashed!;
	},
	async untrash(fileID) {
		await database
			.updateTable('File')
			.set('dateTrashed', null)
			.where('id', '=', fileID)
			.limit(1)
			.executeTakeFirstOrThrow();
	},
};
