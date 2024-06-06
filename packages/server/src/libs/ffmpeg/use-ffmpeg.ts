import Ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import { logger } from '../../index.js';

const ffmpegOptions = {
	logger: {
		debug: (data: unknown) => logger.debug(data, 'ffmpeg'),
		error: (data: unknown) => logger.error(data, 'ffmpeg'),
		info: (data: unknown) => logger.info(data, 'ffmpeg'),
		warn: (data: unknown) => logger.warn(data, 'ffmpeg'),
	},
};

export function useFfmpeg(filePath?: string): FfmpegCommand {
	const ffmpeg = Ffmpeg(filePath, ffmpegOptions);
	process.env.FFMPEG_PATH && ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
	process.env.FFPROBE_PATH && ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
	return ffmpeg;
}
