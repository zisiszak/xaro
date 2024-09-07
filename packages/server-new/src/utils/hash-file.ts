import { createHash } from 'crypto';
import { exerr, isExerr } from 'exitus';
import fs from 'fs';

/**
 * Hashes a file using SHA1. Supports file sizes greater than 4GiB unlike a more simple `fs.readFile` approach.
 *
 * @param path - The absolute path to file to hash.
 * @returns A sha256 hash of the file's contents.
 */
export async function hashFile(path: fs.PathLike): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const hash = createHash('sha256').setEncoding('hex');
		const readStream = fs.createReadStream(path);
		readStream.on('error', (err) => {
			reject(
				exerr({
					message: 'Failed to read data.',
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
			isExerr(err)
				? err
				: exerr({
						caughtException: err,
						message: 'Unknown error',
					}),
		),
	);
}
