import { type FileFormatMetadata } from './file-format.model.js';

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
	originalFilename?: string;
};

export const OriginalFileToMediaRelationshipEnum = {
	Media: 1,
	Thumbnail: 10,
	VideoPreview: 20,
	Subtitles: 30,
	Metadata: 40,
	Dump: 99,
} as const;
export type OriginalFileToMediaRelationship =
	(typeof OriginalFileToMediaRelationshipEnum)[keyof typeof OriginalFileToMediaRelationshipEnum];
