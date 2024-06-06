import {
	contentFileCategoryPrefixMap,
	type ContentFileCategory,
} from '../../../exports.js';

export interface FormatContentFileFilenameProps {
	/** The content ID that the file is associated with */
	contentId: number;
	/** The file's respective category ({@link ContentFileCategory}) */
	fileCategory: ContentFileCategory;
	/** The desired filename extension */
	extension: string;
	/** An optional label that (should) reflect the file's ContentFile database item */
	label?: string | null;
}

/**
 * @returns - A filename for a media file to be imported.
 */
export const formatContentFileFilename = ({
	contentId,
	fileCategory,
	extension,
	label,
}: FormatContentFileFilenameProps) =>
	`${contentFileCategoryPrefixMap[fileCategory]}_${contentId}${label ? `_${label}` : ''}${extension}`;
