import Ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import { logger } from '~/index.js';

export function newFfmpeg(filePath?: string): FfmpegCommand {
	const ffmpeg = Ffmpeg(filePath, {
		logger: logger,
	});

	if (process.env.FFMPEG_PATH) ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
	if (process.env.FFPROBE_PATH) ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

	return ffmpeg;
}
