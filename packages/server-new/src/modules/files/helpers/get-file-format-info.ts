import { extname } from 'path';
import {
	type FileExtension,
	type FileFormatCategory,
	FileFormatCategoryEnum,
	type FileFormatMetadata,
} from '../models/file-format.model.js';
import { fileFormatRepository } from '../repositories/index.js';
import { getImageFileFormatMetadata } from './get-image-file-format-metadata.js';
import { getVideoFileFormatMetadata } from './get-video-file-format-metadata.js';

export const getFileFormatInfo = async (
	filePath: string,
): Promise<{
	formatID: number;
	category: FileFormatCategory;
	metadata: FileFormatMetadata;
}> => {
	const formats = await fileFormatRepository.findAllByExtension(
		extname(filePath) as FileExtension,
	);
	if (!formats) throw 'file format not supported.';

	const { id: formatID, category } = formats[0];

	let metadata: FileFormatMetadata;
	switch (category) {
		case FileFormatCategoryEnum.Image:
			metadata = getImageFileFormatMetadata(filePath);
			break;
		case FileFormatCategoryEnum.Video:
			metadata = await getVideoFileFormatMetadata(filePath).catch(() => ({}));
			break;
		default:
			metadata = {};
			break;
	}

	return { formatID, category, metadata };
};
