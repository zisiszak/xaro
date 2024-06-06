import { type ContentKind } from './content-kinds.js';

export const contentFileCategoriesMap = {
	ORIGINAL: 10,
	CONVERSION: 11,
	RESIZE: 12,
	/**
	 * Optimised for web previewing and such
	 */
	OPTIMISED: 13,

	THUMB_ORIGINAL: 21,
	THUMB_GENERATED: 22,
	THUMB_CUSTOM: 23,

	PREVIEW_VIDEO: 31,
	PREVIEW_GIF: 32,
} as const;
export type ContentFileCategoriesMap = typeof contentFileCategoriesMap;
export type ContentFileCategory =
	ContentFileCategoriesMap[keyof ContentFileCategoriesMap];

export const isThumbnailFileCategory = (v: number): v is 21 | 22 | 23 =>
	v === 21 || v === 22 || v === 23;
export const isVideoOrGifPreviewCategory = (v: number): v is 31 | 32 =>
	v === 31 || v === 32;

export const contentFileCategories = Object.values(contentFileCategoriesMap);

export const contentFileCategoryLabelMap = {
	[contentFileCategoriesMap.ORIGINAL]: 'Original content',
	[contentFileCategoriesMap.CONVERSION]: 'Converted content',
	[contentFileCategoriesMap.RESIZE]: 'Resized content',
	[contentFileCategoriesMap.OPTIMISED]: 'Optimised content',
	[contentFileCategoriesMap.THUMB_ORIGINAL]: 'Original thumbnail',
	[contentFileCategoriesMap.THUMB_GENERATED]: 'Auto-generated thumbnail',
	[contentFileCategoriesMap.THUMB_CUSTOM]: 'Custom thumbnail',
	[contentFileCategoriesMap.PREVIEW_VIDEO]: 'Video preview',
	[contentFileCategoriesMap.PREVIEW_GIF]: 'GIF preview',
} as const satisfies Record<ContentFileCategory, string>;

export const contentFileCategoryPrefixMap = {
	[contentFileCategoriesMap.ORIGINAL]: 'original',
	[contentFileCategoriesMap.CONVERSION]: 'converted',
	[contentFileCategoriesMap.RESIZE]: 'resized',
	[contentFileCategoriesMap.OPTIMISED]: 'optimised',
	[contentFileCategoriesMap.THUMB_ORIGINAL]: 'original-thumb',
	[contentFileCategoriesMap.THUMB_GENERATED]: 'generated-thumb',
	[contentFileCategoriesMap.THUMB_CUSTOM]: 'custom-thumb',
	[contentFileCategoriesMap.PREVIEW_VIDEO]: 'video-preview',
	[contentFileCategoriesMap.PREVIEW_GIF]: 'gif-preview',
} as const satisfies Record<ContentFileCategory, string>;

export function checkContentFileInfoMatchesCategory({
	category,
	contentKind,
}: {
	contentKind: ContentKind;
	category: ContentFileCategory;
}): boolean {
	if (
		(isThumbnailFileCategory(category) && contentKind !== 'image') ||
		(isVideoOrGifPreviewCategory(category) && contentKind !== 'video')
	) {
		return false;
	}
	return true;
}
