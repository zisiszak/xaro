import { createHash } from 'crypto';
import { errorKind, isError, newError } from 'exitus';
import fs from 'fs';
/**
 * Hashes a file using SHA1. Supports file sizes greater than 4GiB unlike a more simple `fs.readFile` approach.
 *
 * @param path - The absolute path to file to hash.
 * @returns A SHA1 hash of the file's contents.
 */
export async function hashFile(path: fs.PathLike) {
	return new Promise<string>((resolve, reject) => {
		const hash = createHash('SHA1').setEncoding('hex');
		const readStream = fs.createReadStream(path);
		readStream.on('error', (err) => {
			reject(
				newError({
					kind: errorKind.fs,
					message: 'File ReadStream error.',
					log: 'error',
					caughtException: err,
					context: {
						filePath: path,
					},
				}),
			);
		});
		readStream.on('data', (chunk) => hash.update(chunk));
		readStream.on('end', () => {
			hash.end();
			resolve(hash.read() as string);
		});
	}).catch((err: unknown) =>
		Promise.reject(
			isError(err)
				? err
				: newError({
						kind: errorKind.unknown,
						caughtException: err,
						log: 'error',
						message: 'Unknown error',
					}),
		),
	);
}
