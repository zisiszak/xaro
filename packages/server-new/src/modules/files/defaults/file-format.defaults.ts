import { type TableInsertion } from '~/modules/database.schema.js';
import { FileFormatCategoryEnum } from '../models/file-format.model.js';

const png = {
	id: 1,
	displayName: 'Portable Network Graphic',
	shortName: 'png',
	extensions: JSON.stringify(['.png']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const;

const jpeg = {
	id: 2,
	displayName: 'Joint Photographic Experts Group',
	shortName: 'jpeg',
	extensions: JSON.stringify(['.jpeg', '.jpg']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const;

const gif = {
	id: 3,
	displayName: 'Graphical Interchange Format',
	shortName: 'gif',
	extensions: JSON.stringify(['.gif']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const;

const avif = {
	id: 4,
	displayName: 'AV1 Image File Format',
	shortName: 'avif',
	extensions: JSON.stringify(['.avif']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const;

const webp = {
	id: 5,
	displayName: 'WebP',
	shortName: 'webp',
	extensions: JSON.stringify(['.webp']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const;

const heif = {
	id: 6,
	displayName: 'High Efficiency Image Format',
	shortName: 'heif',
	extensions: JSON.stringify(['.heif', '.heic']),
	category: FileFormatCategoryEnum.Image,
	description: null,
} as const;

const mp4 = {
	id: 7,
	displayName: 'MP4',
	shortName: 'mp4',
	extensions: JSON.stringify(['.mp4']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const;

const qtff = {
	id: 8,
	displayName: 'QuickTime File Format',
	shortName: 'qtff',
	extensions: JSON.stringify(['.qt', '.mov']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const;

const webm = {
	id: 9,
	displayName: 'WebM',
	shortName: 'WEBM',
	extensions: JSON.stringify(['.webm']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const;

const avi = {
	id: 10,
	displayName: 'Audio Video Interleave',
	shortName: 'avi',
	extensions: JSON.stringify(['.avi']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const;

const ts = {
	id: 11,
	displayName: 'Video Transport Stream',
	shortName: 'ts',
	extensions: JSON.stringify(['.ts']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const;

const mkv = {
	id: 12,
	displayName: 'Matoska Video',
	shortName: 'mkv',
	extensions: JSON.stringify(['.mkv']),
	category: FileFormatCategoryEnum.Video,
	description: null,
} as const;

export const defaultFileFormats: TableInsertion<'FileFormat'>[] = [
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
];
