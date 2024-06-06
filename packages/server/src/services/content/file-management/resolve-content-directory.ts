// 100 media ids per directory, with every directory being generated from the Math.floor(media id / 100)
import { access } from 'fs/promises';
import path from 'path';
import {
	contentFileCategoriesMap,
	type ContentFileCategory,
} from '../../../exports.js';
import { config } from '../../../index.js';
import { mkdirDefaults } from '../../../utils/fs/index.js';
import { FS_ERROR, errorOutcome } from '../../../utils/outcomes.js';

export const MAX_UNIQUE_MEDIA_IDS_PER_DIR = 100;

export interface ResolveContentFileDirectoryProps {
	/** The mediaID that the file is associated with */
	contentId: number;
	/** The file's respective category ({@link ContentFileCategory}) */
	contentFileCategory: ContentFileCategory;
}

/**
 * Resolves the directory that a media file should be placed in. If the directory does not exist yet, it creates it.
 *
 * @returns The absolute path to the media directory, or {@link ERR_UNEXPECTED} if the media directory couldn't be created/accessed.
 *
 * @see {@link MAX_UNIQUE_MEDIA_IDS_PER_DIR}
 */
export const resolveContentFileDirectory = async ({
	contentId,
	contentFileCategory,
}: ResolveContentFileDirectoryProps): Promise<string> => {
	const directory = Math.floor(contentId / MAX_UNIQUE_MEDIA_IDS_PER_DIR);

	let maindir: string;
	switch (contentFileCategory) {
		case contentFileCategoriesMap.ORIGINAL:
			maindir = config.mediaOriginalsDir;
			break;
		case contentFileCategoriesMap.THUMB_CUSTOM:
		case contentFileCategoriesMap.THUMB_ORIGINAL:
		case contentFileCategoriesMap.THUMB_GENERATED:
			maindir = config.mediaThumbnailsDir;
			break;
		case contentFileCategoriesMap.PREVIEW_VIDEO:
		case contentFileCategoriesMap.PREVIEW_GIF:
			maindir = config.mediaPreviewsDir;
			break;
		case contentFileCategoriesMap.CONVERSION:
		case contentFileCategoriesMap.OPTIMISED:
			maindir = config.mediaConvertedDir;
			break;
		case contentFileCategoriesMap.RESIZE:
			maindir = config.mediaResizedDir;
			break;
	}

	const result = path.join(maindir, directory.toString());
	return access(result)
		.catch(() => mkdirDefaults(result))
		.then(() => result)
		.catch((err) => {
			return Promise.reject(
				errorOutcome(FS_ERROR, {
					caughtException: err,
					message:
						'An unexpected error occured while trying to resolve a content file directory.',
					files: result,
					context: {
						contentId,
						contentFileCategory,
					},
				}),
			);
		});
}
