import { type ServerAPI } from '@xaro/server';
import { type GalleryStyle } from '../model/context/view-preferences';

export const filterThumbnailSources = (
	{ kind }: { kind: ServerAPI.GetAboutContent.Success['record']['kind'] },
	{ imagePreviews, original }: ServerAPI.GetAboutContent.Success['files'],
	{
		galleryStyle,
	}: {
		galleryStyle: GalleryStyle;
	},
): null | {
	mainImageSrc: NonNullable<
		ServerAPI.GetAboutContent.Success['files']['original']
	>;
	preloadableImageSrc: ServerAPI.GetAboutContent.Success['files']['original'];
} => {
	let mainSrc = null;
	let preloadableSrc = null;
	const userPreferred = imagePreviews['user-preferred'];
	const optimisedTiny = imagePreviews['optimised-tiny'];
	const optimisedSmall = imagePreviews['optimised-small'];
	const optimisedRegular = imagePreviews['optimised-regular'];
	const originalThumb = imagePreviews['originalThumbnails']
		? imagePreviews['originalThumbnails'][0]!
		: null;
	const optimisedOriginalThumb = imagePreviews['optimised-original-thumbnail']
		? imagePreviews['optimised-original-thumbnail'][0]!
		: null;
	const fallback = imagePreviews['fallbacks']
		? imagePreviews['fallbacks'][0]!
		: null;

	if (userPreferred !== null) {
		mainSrc = userPreferred;
		preloadableSrc = userPreferred;
	} else if (kind === 'image') {
		preloadableSrc = optimisedTiny ?? null;
		if (galleryStyle === 'square-grid-sm' || galleryStyle === 'list') {
			mainSrc =
				optimisedTiny ?? optimisedSmall ?? optimisedRegular ?? original;
		} else if (galleryStyle === 'square-grid-md') {
			mainSrc = optimisedSmall ?? optimisedRegular ?? original;
		} else {
			mainSrc = optimisedRegular ?? optimisedSmall ?? original;
		}
	} else {
		// TODO: Fix this on the server side smh
		// optimisedOriginalThumb ??
		mainSrc =
			originalThumb ??
			(galleryStyle === 'list'
				? optimisedOriginalThumb ?? optimisedTiny
				: optimisedSmall ?? optimisedOriginalThumb) ??
			optimisedRegular;
	}
	mainSrc ??= fallback;

	if (mainSrc === null) {
		return null;
	}

	return {
		mainImageSrc: mainSrc,
		preloadableImageSrc: preloadableSrc,
	};
};
