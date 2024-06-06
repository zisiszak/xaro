import { type FfprobeData } from 'fluent-ffmpeg';
import { errorOutcome } from '../../utils/outcomes.js';
import { useFfmpeg } from './use-ffmpeg.js';

export async function readMetadata(path: string) {
	return new Promise<FfprobeData>((resolve, reject) => {
		try {
			useFfmpeg(path).ffprobe((err: unknown, metadata) => {
				if (err) {
					return reject(
						errorOutcome({
							message: 'Ffprobe failed.',
							caughtException: err,
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
				errorOutcome({
					caughtException: err,
					message: 'Ffmpeg call error.',
					context: {
						filePath: path,
					},
				}),
			);
		}
	});
}
