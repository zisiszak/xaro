import { imageSize } from 'image-size';
import { type ImageFileFormatMetadata } from '../models/index.js';

export const readImageFileFormatMetadata = (filePath: string): ImageFileFormatMetadata => {
	const { width, height } = imageSize(filePath) ?? {};
	return { width, height };
};
