import { type FfprobeData } from 'fluent-ffmpeg';

export type ExtractedVideoMetadata = FfprobeData;
export type ExtractedImageMetadata = {
	width?: number;
	height?: number;
};
