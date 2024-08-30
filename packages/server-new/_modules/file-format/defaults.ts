import { FileFormatCategoryEnum, type FileFormatDto } from './model.js';

const png = {
	id: 1,
	name: 'Portable Network Graphic',
	shortName: 'png',
	extensions: new Set(['.png']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const satisfies FileFormatDto;

const jpeg = {
	id: 2,
	name: 'Joint Photographic Experts Group',
	shortName: 'jpeg',
	extensions: new Set(['.jpeg', '.jpg']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const satisfies FileFormatDto;

const gif = {
	id: 3,
	name: 'Graphical Interchange Format',
	shortName: 'gif',
	extensions: new Set(['.gif']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const satisfies FileFormatDto;

const avif = {
	id: 4,
	name: 'AV1 Image File Format',
	shortName: 'avif',
	extensions: new Set(['.avif']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const satisfies FileFormatDto;

const webp = {
	id: 5,
	name: 'WebP',
	shortName: 'webp',
	extensions: new Set(['.webp']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const satisfies FileFormatDto;

const heif = {
	id: 6,
	name: 'High Efficiency Image Format',
	shortName: 'heif',
	extensions: new Set(['.heif', '.heic']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const satisfies FileFormatDto;

const mp4 = {
	id: 7,
	name: 'MP4',
	shortName: 'mp4',
	extensions: new Set(['.mp4']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const satisfies FileFormatDto;

const qtff = {
	id: 8,
	name: 'QuickTime File Format',
	shortName: 'qtff',
	extensions: new Set(['.qt', '.mov']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const satisfies FileFormatDto;

const webm = {
	id: 9,
	name: 'WebM',
	shortName: 'WEBM',
	extensions: new Set(['.webm']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const satisfies FileFormatDto;

const avi = {
	id: 10,
	name: 'Audio Video Interleave',
	shortName: 'avi',
	extensions: new Set(['.avi']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const satisfies FileFormatDto;

const ts = {
	id: 11,
	name: 'Video Transport Stream',
	shortName: 'ts',
	extensions: new Set(['.ts']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const satisfies FileFormatDto;

const mkv = {
	id: 12,
	name: 'Matoska Video',
	shortName: 'mkv',
	extensions: new Set(['.mkv']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const satisfies FileFormatDto;

export const defaultFileFormats = {
	png,
	jpeg,
	gif,
	mp4,
	mkv,
	ts,
	qtff,
	heif,
	avi,
	avif,
	webm,
	webp,
};
