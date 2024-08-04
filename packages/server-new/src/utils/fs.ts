import { type GenericError, isError, newError } from 'exitus';
import fs from 'fs';
import { type Guard, is } from 'is-guard';
import path from 'path';

export function trueBasename(filePath: string): string {
	return path.basename(filePath, path.extname(filePath));
}

export async function mkdirRecursive(dir: string): Promise<string | undefined> {
	return fs.promises.mkdir(dir, { recursive: true });
}

export async function mkdirDefaults(...dirs: string[]): Promise<string[] | GenericError> {
	return Promise.all(
		dirs.map(async (dir) => {
			const isDirectory = await isDir(dir);
			if (isDirectory === true) return;
			if (isDirectory === undefined) {
				return mkdirRecursive(dir);
			}
			return newError({ message: `Path is not a directory: ${dir}` });
		}),
	).then((result) => result.filter(is.string));
}

export interface FilePathInfo {
	dirname: string;
	basename: string;
	extension: string;
}
export function resolveFilePathInfo(filePath: string): FilePathInfo {
	const extension = path.extname(filePath);
	const dirname = path.dirname(filePath);
	const basename = path.basename(filePath, extension);

	return { extension, dirname, basename };
}

/**
 *
 * @param path - path to test
 * @returns undefined if path doesn't exist, true if dir, false if file
 */
export async function isDir(path: string): Promise<boolean | undefined> {
	return fs.promises
		.stat(path)
		.then((res) => res.isDirectory())
		.catch(() => undefined);
}

export async function moveFile(
	oldPath: string,
	newPath: string,
): Promise<ErrorResultTuple<() => Promise<GenericError | void>>> {
	return fs.promises
		.rename(oldPath, newPath)
		.then(() => {
			return [
				undefined,
				async () =>
					fs.promises.rename(newPath, oldPath).catch((err) =>
						newError({
							message:
								'File Move Error [moveFile] - Could not undo previous file move.',
							caughtException: err,
						}),
					),
			] as const;
		})
		.catch(
			(err) =>
				[
					newError({
						message: 'File Move Error [moveFile] - Could not rename file.',
						caughtException: err,
					}),
				] as const,
		);
}

export async function doesFileExist(filePath: string) {
	return fs.promises
		.access(filePath)
		.then(() => true)
		.catch(() => false);
}

/**
 *
 * @param filepath - Absolute path to file
 * @returns - Size in bytes.
 */
export async function readFileSize(filepath: string): Promise<number | GenericError> {
	return fs.promises
		.stat(filepath)
		.then((stats) => stats.size)
		.catch((err: unknown) =>
			newError({
				caughtException: err,
				context: {
					file: filepath,
				},
			}),
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

export async function readAndParseJson<O>(
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
			return result;
		});
}
