export type * from './records.js';

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

export type FileOriginKind = (typeof FileOriginKindEnum)[keyof typeof FileOriginKindEnum];
export const FileOriginKindEnum = {
	/** Directly uploaded by a user. */
	UploadedByUser: 1,
	/** Downloaded using an extractor. */
	DownloadedViaExtractor: 2,
	/** Generated from a file with rel `Content` */
	GeneratedFromFile: 10,
	/** For embedded files that have been extracted from an existing file (e.g. thumbnails from a video) */
	EmbeddedInOtherFile: 11,
} as const;

export interface GeneratedFileOrigin {
	kind: typeof FileOriginKindEnum.GeneratedFromFile;
	fileID: number;
}
export interface EmbeddedFileOrigin {
	kind: typeof FileOriginKindEnum.EmbeddedInOtherFile;
	fileID?: number;
	dataHash?: string;
	fileHash?: string;
}
export interface UploadedFileOrigin {
	kind: typeof FileOriginKindEnum.UploadedByUser;
}
export interface DownloadedFileOrigin {
	kind: typeof FileOriginKindEnum.DownloadedViaExtractor;
	sourceUrl: string;
	sourceId?: string;
}
export type FileOrigin =
	| GeneratedFileOrigin
	| EmbeddedFileOrigin
	| UploadedFileOrigin
	| DownloadedFileOrigin;

export type FileMetadata = FileFormatMetadata & {
	originalFilename?: string | null;
};
