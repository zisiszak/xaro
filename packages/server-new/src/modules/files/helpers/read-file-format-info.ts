import { extname } from 'path';
import {
	type FileExtension,
	type FileFormatCategory,
	FileFormatCategoryEnum,
	type FileFormatMetadata,
} from '../models/index.js';
import { fileFormatRepository } from '../repositories/index.js';
import { readImageFileFormatMetadata } from './read-image-file-format-metadata.js';
import { readVideoFileFormatMetadata } from './read-video-file-format-metadata.js';

export const readFileFormatInfo = async (
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
			metadata = readImageFileFormatMetadata(filePath);
			break;
		case FileFormatCategoryEnum.Video:
			metadata = await readVideoFileFormatMetadata(filePath).catch(() => ({}));
			break;
		default:
			metadata = {};
			break;
	}

	return { formatID, category, metadata };
};
