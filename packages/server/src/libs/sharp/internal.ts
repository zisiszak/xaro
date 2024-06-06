import { defaultsMerger } from '../../utils/types-and-guards/merge-object-defaults.js';
import { type FormatOptions } from './types.js';

const defaultJpegFormatOptions = {
	format: '.jpeg',
	quality: 80,
	progressive: false,
} as const satisfies FormatOptions<'.jpeg'>;
export const parseJpegFormatOptions = defaultsMerger<
	FormatOptions<'.jpeg'>,
	typeof defaultJpegFormatOptions
>({
	defaults: defaultJpegFormatOptions,
});

const defaultPngFormatOptions = {
	format: '.png',
	compressionLevel: 6,
	progressive: false,
} as const satisfies FormatOptions<'.png'>;
export const parsePngFormatOptions = defaultsMerger<
	FormatOptions<'.png'>,
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
} as const satisfies FormatOptions<'.webp'>;
export const parseWebpFormatOptions = defaultsMerger<
	FormatOptions<'.webp'>,
	typeof defaultWebpFormatOptions
>({
	defaults: defaultWebpFormatOptions,
});

const defaultGifFormatOptions = {
	format: '.gif',
	reuse: false,
} as const satisfies FormatOptions<'.gif'>;
export const parseGifFormatOptions = defaultsMerger({
	defaults: defaultGifFormatOptions,
	defaultOnTypes: {
		EMPTY_STRING: false,
	},
});

const defaultAvifFormatOptions = {
	format: '.avif',
	quality: 65,
} as const satisfies FormatOptions<'.avif'>;
export const parseAvifFormatOptions = defaultsMerger({
	defaults: defaultAvifFormatOptions,
});
