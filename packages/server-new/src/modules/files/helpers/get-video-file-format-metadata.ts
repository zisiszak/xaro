import { ffmpeg } from '~/utils/index.js';
import { type VideoFileFormatMetadata } from '../models/index.js';

export const getVideoFileFormatMetadata = (filePath: string): Promise<VideoFileFormatMetadata> =>
	ffmpeg.readMetadata(filePath).then((metadata) => {
		const result: VideoFileFormatMetadata = {
			bitrate: metadata.format.bit_rate,
			duration: metadata.format.duration,
			height: metadata.streams[0]?.height,
			width: metadata.streams[0]?.width,
			framerate: metadata.streams[0]?.r_frame_rate
				? parseFloat(metadata.streams[0].r_frame_rate)
				: undefined,
		};
		return result;
	});
