import {
	getContentFileFilenameInfo,
	type ContentKind,
	type ImageContentFileExtension,
	type VideoContentFileExtension,
} from '../../../data/model/shared/content-kinds.js';

import { getFileSize } from '~/utils/fs/index.js';
import {
	GenericError,
	contentFileCategoriesMap,
	errorOutcome,
	isThumbnailFileCategory,
	type ContentFileCategory,
} from '../../../exports.js';
import { ffmpeg } from '../../../libs/ffmpeg/index.js';
import {
	type ExtractedImageMetadata,
	type ExtractedVideoMetadata,
} from '../../../libs/ffmpeg/types.js';
import { hashFile } from '../../../utils/fs/hash-file.js';
import { readImageFileDimensions } from '../../../utils/media-utils/read-image-file-dimensions.js';

export interface ContentFileInfo<Kind extends ContentKind> {
	contentKind: Kind;

	basename: string;

	extension: Kind extends 'image'
		? ImageContentFileExtension
		: VideoContentFileExtension;

	size: number;

	hash: string;

	extractedMetadata:
		| (Kind extends 'image'
				? ExtractedImageMetadata
				: ExtractedVideoMetadata)
		| null;
};

export const readContentFileInfo = async <
	Kind extends ContentKind,
	Category extends ContentFileCategory,
>(
	filePath: string,
	fileCategory: Category,
): Promise<
	| ContentFileInfo<Kind>
	| GenericError
> => {
	const { kind, basename, ext } = getContentFileFilenameInfo(filePath);
	if (kind === 'unsupported') {
		return errorOutcome({
			'message': "Kind is not supported"
		});
	}
	if (
		(isThumbnailFileCategory(fileCategory) && kind !== 'image') ||
		(fileCategory === contentFileCategoriesMap.PREVIEW_VIDEO &&
			kind !== 'video')
	) {
		return errorOutcome({
			message: "Kind does not match provided file category."
		})
	}

	const size = await getFileSize(filePath);
	const hash = await hashFile(filePath);

	let extractedMetadata:
		| ExtractedImageMetadata
		| ExtractedVideoMetadata
		| null = null;
	if (kind === 'image') {
		extractedMetadata = readImageFileDimensions(filePath);
	} else if (kind === 'video') {
		extractedMetadata = await ffmpeg
			.readMetadata(filePath)
			.then((result) => {
				if (typeof result === 'symbol') {
					return null;
				}
				return result;
			});
	}

	return {
		contentKind: kind as Kind,
		basename,
		extension: ext as Kind extends 'image'
			? ImageContentFileExtension
			: VideoContentFileExtension,
		size: size,
		hash: hash,
		extractedMetadata: extractedMetadata as Kind extends 'image'
			? ExtractedImageMetadata
			: ExtractedVideoMetadata,
	};
};
