import Ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import { initXaro } from '../../index.js';

export function newFfmpeg(filePath?: string): FfmpegCommand {
	const ffmpeg = Ffmpeg(filePath, {
		logger: initXaro.log,
	});

	if (initXaro.config.ffmpegPath) ffmpeg.setFfmpegPath(initXaro.config.ffmpegPath);
	if (initXaro.config.ffprobePath) ffmpeg.setFfprobePath(initXaro.config.ffprobePath);

	return ffmpeg;
}
