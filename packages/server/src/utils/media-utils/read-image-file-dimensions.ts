import { imageSize } from 'image-size';
import { type ExtractedImageMetadata } from '../../libs/ffmpeg/types.js';

export const readImageFileDimensions = (path: string) => {
	const { width, height } = imageSize(path) ?? {};
	return {
		width,
		height,
	} satisfies ExtractedImageMetadata;
};
