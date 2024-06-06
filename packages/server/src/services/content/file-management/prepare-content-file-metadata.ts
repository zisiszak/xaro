import {
	type ImageContentFileMetadata,
	type VideoContentFileMetadata,
} from '../../../data/model/shared/content-file-metadata.js';
import { type ContentKind } from '../../../data/model/shared/content-kinds.js';
import {
	type ExtractedImageMetadata,
	type ExtractedVideoMetadata,
} from '../../../libs/ffmpeg/types.js';

export const prepareExtractedVideoFileMetadata = (
	metadata: ExtractedVideoMetadata,
): VideoContentFileMetadata => ({
	bitrate: metadata.format.bit_rate,
	duration: metadata.format.duration,
	height: metadata.streams[0]?.height,
	width: metadata.streams[0]?.width,
	framerate: metadata.streams[0]?.r_frame_rate,
	extractedMetadata: JSON.stringify(metadata),
});

export const prepareExtractedImageFileMetadata = (
	metadata: ExtractedImageMetadata,
): ImageContentFileMetadata => ({
	width: metadata.width,
	height: metadata.height,
	extractedMetadata: JSON.stringify(metadata),
});

export const prepareExtractedFileMetadata = <K extends ContentKind>(
	mediaKind: K,
	metadata:
		| (K extends 'image' ? ExtractedImageMetadata : ExtractedVideoMetadata)
		| null,
):
	| ImageContentFileMetadata
	| VideoContentFileMetadata
	| Record<string, never> =>
	metadata === null
		? {}
		: mediaKind === 'image'
			? prepareExtractedImageFileMetadata(
					metadata as ExtractedImageMetadata,
				)
			: prepareExtractedVideoFileMetadata(
					metadata as ExtractedVideoMetadata,
				);
