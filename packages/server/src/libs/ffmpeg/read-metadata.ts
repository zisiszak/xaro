import { newError } from 'exitus';
import { type FfprobeData } from 'fluent-ffmpeg';
import { useFfmpeg } from './use-ffmpeg.js';

export async function readMetadata(path: string) {
	return new Promise<FfprobeData>((resolve, reject) => {
		try {
			useFfmpeg(path).ffprobe((err: unknown, metadata) => {
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
