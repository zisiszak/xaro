import { type ContentFile } from '../tables/index.js';

export type VideoContentFileMetadata = Pick<
	ContentFile.Insertion,
	| 'bitrate'
	| 'duration'
	| 'height'
	| 'width'
	| 'framerate'
	| 'extractedMetadata'
>;
export type ImageContentFileMetadata = Pick<
	ContentFile.Insertion,
	'width' | 'height' | 'extractedMetadata'
>;
