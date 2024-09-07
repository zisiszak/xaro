import { defaultsMerger } from '~/utils/index.js';
import { type ImageFormatOptions } from './types.js';

const defaultJpegFormatOptions = {
	format: '.jpeg',
	quality: 80,
	progressive: false,
} as const satisfies ImageFormatOptions<'.jpeg'>;
export const parseJpegFormatOptions = defaultsMerger<
	ImageFormatOptions<'.jpeg'>,
	typeof defaultJpegFormatOptions
>({
	defaults: defaultJpegFormatOptions,
});

const defaultPngFormatOptions = {
	format: '.png',
	compressionLevel: 6,
	progressive: false,
} as const satisfies ImageFormatOptions<'.png'>;
export const parsePngFormatOptions = defaultsMerger<
	ImageFormatOptions<'.png'>,
	typeof defaultPngFormatOptions
>({
	defaults: defaultPngFormatOptions,
});

const defaultWebpFormatOptions = {
	format: '.webp',
	lossless: false,
	nearLossless: false,
	quality: 80,
	smartSubsample: false,
} as const satisfies ImageFormatOptions<'.webp'>;
export const parseWebpFormatOptions = defaultsMerger<
	ImageFormatOptions<'.webp'>,
	typeof defaultWebpFormatOptions
>({
	defaults: defaultWebpFormatOptions,
});

const defaultGifFormatOptions = {
	format: '.gif',
	reuse: false,
} as const satisfies ImageFormatOptions<'.gif'>;
export const parseGifFormatOptions = defaultsMerger({
	defaults: defaultGifFormatOptions,
	defaultOnTypes: {
		EMPTY_STRING: false,
	},
});

const defaultAvifFormatOptions = {
	format: '.avif',
	quality: 65,
} as const satisfies ImageFormatOptions<'.avif'>;
export const parseAvifFormatOptions = defaultsMerger({
	defaults: defaultAvifFormatOptions,
});
