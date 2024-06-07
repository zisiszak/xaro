import { GenericError, errorKind, isError, newError } from 'exitus';
import fs from 'fs';
import { Guard, is } from 'is-guard';
import path from 'path';

export * from './get-filename-info.js';
export * from './get-matching-files.js';
export * from './hash-file.js';

export function trueBasename(filePath: string) {
	return path.basename(filePath, path.extname(filePath));
}

/**
 *
 * @param path - path to test
 * @returns undefined if path doesn't exist, true if dir, false if file
 */
export async function isDir(path: string): Promise<boolean | undefined> {
	return await fs.promises
		.stat(path)
		.then((res) => res.isDirectory())
		.catch(() => undefined);
}

/**
 *
 * @param path - path to test
 * @returns undefined if path doesn't exist, true if dir, false if file
 */
export function isDirSync(path: string): boolean | undefined {
	try {
		return fs.statSync(path).isDirectory();
	} catch {
		return undefined;
	}
}

export async function mkdirRecursive(dir: string): Promise<string | undefined> {
	return fs.promises.mkdir(dir, { recursive: true });
}

export async function mkdirDefaults(...dirs: string[]): Promise<string[]> {
	return Promise.all(
		dirs.map(async (dir) => {
			const isDirectory = await isDir(dir);
			if (isDirectory === true) return;
			if (isDirectory === undefined) {
				return mkdirRecursive(dir);
			}
			throw new Error(`Path is not a directory: ${dir}`);
		}),
	).then((result) => result.filter(is.string));
}

// GENERIC FUNCS
export const readFilenames = async (dir: string) => {
	if ((await isDir(dir)) !== true) {
		return null;
	}
	const dirents = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => null);
	if (dirents === null) {
		return null;
	}
	return dirents.filter((file) => file.isFile()).map((file) => file.name);
};
export const readFilteredFilenames = async (
	dir: string,
	predicate: (filename: string) => boolean,
) => {
	const files = await readFilenames(dir);
	if (files === null) {
		return null;
	}
	return files.filter(predicate);
};

export async function readDirnames(dir: string) {
	return isDir(dir)
		.then<GenericError | fs.Dirent[]>((isDir) => {
			if (isDir === false) {
				return newError({
					message: 'Path is file.',
					context: {
						path: dir,
					},
				});
			}
			if (isDir === undefined) {
				return newError({
					message: 'Path not found.',
					context: {
						path: dir,
					},
				});
			}
			return fs.promises.readdir(dir, { withFileTypes: true });
		})
		.then((dirents) =>
			isError(dirents)
				? dirents
				: dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name),
		)
		.catch((err) =>
			newError({
				kind: errorKind.unexpected,
				message: 'readDirnames unhandled exception',
				log: 'error',
				caughtException: err,
				context: {
					path: dir,
				},
			}),
		);
}

/**
 *
 * @param filepath - Absolute path to file
 * @returns - Size in bytes.
 */
export async function getFileSize(filepath: string): Promise<number> {
	return fs.promises
		.stat(filepath)
		.then((stats) => stats.size)
		.catch((err: unknown) =>
			Promise.reject(
				newError({
					kind: errorKind.fs,
					caughtException: err,
					payload: {
						file: filepath,
					},
				}),
			),
		);
}

export async function readFirstNBytes(filePath: string, numBytes: number): Promise<Buffer> {
	const chunks = [];
	for await (const chunk of fs.createReadStream(filePath, {
		start: 0,
		end: numBytes - 1,
	})) {
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}

export async function readAndParseJSON<O>(
	path: string,
	typeguard: Guard<O>,
	{
		encoding = 'utf-8',
	}: {
		encoding?: BufferEncoding;
	} = {},
) {
	return fs.promises
		.readFile(path, { encoding })
		.catch((err) =>
			Promise.reject(
				newError({
					caughtException: err,
					message: 'Failed to read file',
					context: {
						path,
					},
				}),
			),
		)
		.then(JSON.parse)
		.catch((err) => {
			if (isError(err)) {
				return Promise.reject(err);
			}
			return Promise.reject(
				newError({
					message: 'Failed to parse JSON.',
					caughtException: err,
					context: {
						path,
					},
				}),
			);
		})
		.then((result) => {
			if (!typeguard(result)) {
				return Promise.reject(
					newError({
						message: 'Parsed JSON does not satisfy guard conditions.',
						context: {
							path,
							typeguard: typeguard.name,
						},
					}),
				);
			}
			return result as O;
		});
}
