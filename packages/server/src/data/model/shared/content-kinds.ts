import {
	parseFilename,
	type FileKindExtensionMap,
} from '../../../utils/fs/get-filename-info.js';

export const contentKinds = ['image', 'video'] as const;
export type ContentKind = 'image' | 'video';

export type VideoContentFileExtension = (typeof videoExtensions)[number];
export const videoExtensions = [
	'.mp4',
	'.webm',
	'.mkv',
	'.avi',
	'.mov',
	'.ts',
] as const;

export type ImageContentFileExtension = (typeof imageExtensions)[number];
export const imageExtensions = [
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.webp',
	'.avif',
] as const;

export type ContentFileExtension =
	| ImageContentFileExtension
	| VideoContentFileExtension;

export const contentFileExtensionMap = {
	...Object.fromEntries<'image'>(
		imageExtensions.map((ext) => [ext, 'image']),
	),
	...Object.fromEntries<'video'>(
		videoExtensions.map((ext) => [ext, 'video']),
	),
} as FileKindExtensionMap<ImageContentFileExtension, 'image'> &
	FileKindExtensionMap<VideoContentFileExtension, 'video'>;
export type ContentFileExtensionMap = typeof contentFileExtensionMap;

export const isContentKind = (value: unknown): value is ContentKind =>
	contentKinds.includes(value as ContentKind);

export const getContentFileFilenameInfo = (file: string) =>
	parseFilename(file, contentFileExtensionMap);
