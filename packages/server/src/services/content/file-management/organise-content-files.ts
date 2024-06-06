import { __coreParams } from '../../../config/core-params.js';
import { contentFileCategoriesMap } from '../../../data/model/shared/content-file-categories.js';
import {
	type ContentFileExtension,
	type ContentKind,
} from '../../../data/model/shared/content-kinds.js';
import { type ContentFile } from '../../../data/model/tables/index.js';

export type ContentFileBasicInfo = {
	fileId: number;
	staticPath: string;
	fileSize: number;
	extension: ContentFileExtension;
	framerate: string | number | null;
	width: number | null;
	height: number | null;
};

export type OrganisedContentFilePaths = {
	imagePreviews: {
		'user-preferred': ContentFileBasicInfo | null;
		'full-size': ContentFileBasicInfo[] | null;
		'optimised-original-thumbnail': ContentFileBasicInfo[] | null;
		fallbacks: ContentFileBasicInfo[] | null;
		originalThumbnails: ContentFileBasicInfo[] | null;
	} & Record<
		(typeof __coreParams.contentFileOptimisation.labels)[number],
		ContentFileBasicInfo | null
	>;
	videoPreviews: ContentFileBasicInfo[] | null;
	original: ContentFileBasicInfo | null;
	converted: ContentFileBasicInfo[] | null;
	resized: ContentFileBasicInfo[] | null;
	optimised: ContentFileBasicInfo[] | null;
};

const formatInfo = ({
	extension,
	width,
	height,
	id: fileId,
	path,
	size: fileSize,
	framerate,
}: ContentFile.Selection): ContentFileBasicInfo => ({
	extension,
	width,
	height,
	fileId,
	fileSize,
	framerate,
	staticPath: `/static.media/${path}`,
});

export const organiseContentFilePaths = (
	kind: ContentKind,
	contentFiles: ContentFile.Selection[],
	preferredThumbnailId: number | null = -1,
): OrganisedContentFilePaths => {
	const result: OrganisedContentFilePaths = {
		imagePreviews: {
			'user-preferred': null,
			'full-size': null,
			'optimised-tiny': null,
			'optimised-small': null,
			'optimised-regular': null,
			'optimised-original-thumbnail': null,
			fallbacks: null,
			originalThumbnails: null,
		},
		original: null,
		resized: null,
		videoPreviews: null,
		converted: null,
		optimised: null,
	};

	for (let i = 0; i < contentFiles.length; i++) {
		const file = contentFiles[i]!;
		const formatted = formatInfo(file);
		if (preferredThumbnailId === file.id) {
			result.imagePreviews['user-preferred'] = formatted;
		}

		switch (file.category) {
			case contentFileCategoriesMap.ORIGINAL: {
				result.original = formatted;
				if (kind === 'image') {
					result.imagePreviews['full-size'] ??= [];
					result.imagePreviews['full-size'].push(formatted);
				}
				break;
			}
			case contentFileCategoriesMap.OPTIMISED: {
				const label = file.label;
				if (
					kind === 'image' &&
					label &&
					__coreParams.contentFileOptimisation.labels.includes(
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						label as any,
					)
				) {
					result.imagePreviews[label] = formatted;
				}
				result.optimised ??= [];
				result.optimised.push(formatted);
				break;
			}
			case contentFileCategoriesMap.CONVERSION: {
				result.converted ??= [];
				result.converted.push(formatted);
				break;
			}
			case contentFileCategoriesMap.RESIZE: {
				result.resized ??= [];
				result.resized.push(formatted);
				break;
			}
			case contentFileCategoriesMap.PREVIEW_VIDEO:
			case contentFileCategoriesMap.PREVIEW_GIF: {
				result.videoPreviews ??= [];
				result.videoPreviews.push(formatted);
				break;
			}
			case contentFileCategoriesMap.THUMB_CUSTOM:
			case contentFileCategoriesMap.THUMB_ORIGINAL: {
				result.imagePreviews.originalThumbnails ??= [];
				result.imagePreviews.originalThumbnails.push(formatted);

				break;
			}

			case contentFileCategoriesMap.THUMB_GENERATED: {
				if (file.extension === '.avif') {
					result.imagePreviews['optimised-original-thumbnail'] ??= [];
					result.imagePreviews['optimised-original-thumbnail'].push(
						formatted,
					);
					continue;
				}
				result.imagePreviews.fallbacks ??= [];
				result.imagePreviews.fallbacks.push(formatted);
			}
		}
	}

	return result;
};
