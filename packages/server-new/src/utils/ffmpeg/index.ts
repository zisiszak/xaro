import { newFfmpeg } from './new-ffmpeg.js';
import { readMetadata } from './read-metadata.js';
import { generateThumbnails } from './thumbnails/generate-thumbnails.js';

export const ffmpeg = {
	generateThumbnails: generateThumbnails,
	readMetadata: readMetadata,
	new: newFfmpeg,
};
