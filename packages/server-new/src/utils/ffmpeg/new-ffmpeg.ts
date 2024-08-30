import Ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import { xaro } from '../../index.js';

export function newFfmpeg(filePath?: string): FfmpegCommand {
	const ffmpeg = Ffmpeg(filePath, {
		logger: xaro.log,
	});

	if (process.env.FFMPEG_PATH) ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
	if (process.env.FFPROBE_PATH) ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

	return ffmpeg;
}
