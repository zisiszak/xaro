import { imageSize } from 'image-size';
import { type ImageFileFormatMetadata } from '../models/file-format.model.js';

export const getImageFileFormatMetadata = (filePath: string): ImageFileFormatMetadata => {
	const { width, height } = imageSize(filePath) ?? {};
	return { width, height };
};
