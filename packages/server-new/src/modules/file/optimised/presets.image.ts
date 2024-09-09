import { type ImageFormatOptions, type ImageOutputFormat } from '~/utils/index.js';

export interface OptimisedImagePreset<Format extends ImageOutputFormat> {
	label: string;
	formatOptions: ImageFormatOptions<Format>;
	resize?: number;
}

const tinyAVIF: OptimisedImagePreset<'.avif'> = {
	label: 'smallAVIF',
	formatOptions: {
		format: '.avif',
		quality: 55,
	},
	resize: 64,
} as const;

const smallAVIF: OptimisedImagePreset<'.avif'> = {
	label: 'mediumAVIF',
	formatOptions: {
		format: '.avif',
		quality: 60,
	},
	resize: 320,
} as const;

const largeAVIF: OptimisedImagePreset<'.avif'> = {
	label: 'largeAVIF',
	formatOptions: {
		format: '.avif',
		quality: 60,
	},
	resize: 800,
} as const;

const xlargeAVIF: OptimisedImagePreset<'.avif'> = {
	label: 'xlargeAVIF',
	formatOptions: {
		format: '.avif',
		quality: 65,
	},
	resize: 2000,
} as const;

export const optimisedImagePresetMap = {
	tinyAVIF: tinyAVIF,
	smallAVIF: tinyAVIF,
	mediumAVIF: smallAVIF,
	largeAVIF,
	xlargeAVIF,
} as const;

export const optimisedImagePresets = Array.from(Object.values(optimisedImagePresetMap));
