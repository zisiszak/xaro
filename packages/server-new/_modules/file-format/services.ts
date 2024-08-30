import path from 'path';
import { readImageFileFormatMetadata, readVideoFileFormatMetadata } from './helpers.js';
import { FileFormatRepository } from './index.js';
import {
	type FileFormatCategory,
	FileFormatCategoryEnum,
	type FileFormatMetadata,
} from './model.js';

export const getFileFormatInfo = async (
	filePath: string,
): Promise<{
	formatID: number;
	category: FileFormatCategory;
	metadata: FileFormatMetadata;
}> => {
	const formats = FileFormatRepository.findAllByExtension(path.extname(filePath));
	if (!formats) throw 'format not supported.';

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
