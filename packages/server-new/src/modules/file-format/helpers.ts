import { imageSize } from 'image-size';
import { extname } from 'path';
import { ffmpeg } from '~/utils/index.js';
import {
	type FileExtension,
	type FileFormatCategory,
	FileFormatCategoryEnum,
	type FileFormatMetadata,
	type ImageFileFormatMetadata,
	type VideoFileFormatMetadata,
} from './model.js';
import { fileFormatRepository } from './sqlite.repository.js';

export const readImageFileFormatMetadata = (filePath: string): ImageFileFormatMetadata => {
	const { width, height } = imageSize(filePath) ?? {};
	return { width, height };
};

export const readVideoFileFormatMetadata = (filePath: string): Promise<VideoFileFormatMetadata> =>
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
