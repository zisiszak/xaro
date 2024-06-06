import { createGuard, is } from 'is-guard';
import { readMetadata } from './read-metadata.js';
import { generateThumbnails } from './thumbnails/generate-thumbnails.js';
import { useFfmpeg } from './use-ffmpeg.js';

export type { GenerateThumbnailsProps as GenerateThumbnailProps } from './thumbnails/generate-thumbnails.js';

export interface FfmpegConfig {
	ffmpegPath?: string;
	ffprobePath?: string;
}
const isFfpmegConfig = createGuard.objectWithProps<FfmpegConfig>({
	optional: {
		ffmpegPath: is.string,
		ffprobePath: is.string,
	},
	noExtraKeys: true,
});

export const ffmpeg = {
	generateThumbnails: generateThumbnails,
	readMetadata: readMetadata,
	use: useFfmpeg,
	isConfig: isFfpmegConfig,
};
