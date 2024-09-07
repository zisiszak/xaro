import { exerr, isExerr } from 'exitus';
import { type FfprobeData } from 'fluent-ffmpeg';
import { newFfmpeg } from './new-ffmpeg.js';

export async function readMetadata(path: string): Promise<FfprobeData> {
	return new Promise<FfprobeData>((resolve, reject) => {
		try {
			newFfmpeg(path).ffprobe((err: unknown, metadata) => {
				if (err) {
					return reject(
						exerr({
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
			if (isExerr(err)) throw err;
			throw exerr({
				caughtException: err,
				message: 'Ffmpeg call error.',
				context: { filePath: path },
			});
		}
	});
}
