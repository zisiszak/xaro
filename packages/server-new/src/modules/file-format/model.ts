export type FileExtension = `.${string}`;

export type FileFormatCategory =
	(typeof FileFormatCategoryEnum)[keyof typeof FileFormatCategoryEnum];
export const FileFormatCategoryEnum = {
	Image: 1,
	Video: 2,
	Audio: 3,
	Text: 10,
	Metadata: 20,
	Subtitles: 21,
	Temp: 80,
	Dump: 91,
	Unrecognised: 99,
} as const;

export interface VideoFileFormatMetadata {
	/** pixels */
	width?: number;
	/** pixels */
	height?: number;
	/** bits per second */
	bitrate?: number;
	/** frames per second */
	framerate?: number;
	/** seconds */
	duration?: number;
	quality?: number;
	lossless?: boolean;
	compressed?: boolean;
}

export interface ImageFileFormatMetadata {
	/** pixels */
	width?: number;
	/** pixels */
	height?: number;
	quality?: number;
	lossless?: boolean;
	compressed?: boolean;
}

export type FileFormatMetadata = ImageFileFormatMetadata | VideoFileFormatMetadata;
