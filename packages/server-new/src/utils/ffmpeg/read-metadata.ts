import { newError } from 'exitus';
import { type FfprobeData } from 'fluent-ffmpeg';
import { newFfmpeg } from './new-ffmpeg.js';

export async function readMetadata(path: string): Promise<FfprobeData> {
	return new Promise<FfprobeData>((resolve, reject) => {
		try {
			newFfmpeg(path).ffprobe((err: unknown, metadata) => {
				if (err) {
					return reject(
						newError({
							message: 'Ffprobe failed.',
							caughtException: err,
							log: 'error',
							context: {
								filePath: path,
							},
						}),
					);
				}

				resolve(metadata);
			});
		} catch (err) {
			return Promise.reject(
				newError({
					caughtException: err,
					message: 'Ffmpeg call error.',
					log: 'error',
					context: {
						filePath: path,
					},
				}),
			);
		}
	});
}
