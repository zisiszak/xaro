import { createHash } from 'crypto';
import fs from 'fs';
import {
	FS_ERROR,
	UNKNOWN_ERROR,
	errorOutcome,
	isErrorOutcome,
} from '../outcomes.js';

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
				errorOutcome(FS_ERROR, {
					message: 'File ReadStream error.',
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
			isErrorOutcome(err)
				? err
				: errorOutcome(UNKNOWN_ERROR, {
						caughtException: err,
						message: 'Unknown error',
					}),
		),
	);
}
