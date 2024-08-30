import {
	type ImageFileFormatMetadata,
	type VideoFileFormatMetadata,
} from '../file-format/model.js';

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

export type FileMetadata = (VideoFileFormatMetadata | ImageFileFormatMetadata) & {
	originalFilename?: string;
};

export interface FileDto {
	id: number;
	formatID: number;
	fileHash: string;
	dataHash: string | null;
	size: number;
	path: string | null;
	origin: FileOrigin;
	metadata: FileMetadata;
	dateAdded: Date;
}

export type InsertableFileDto = Partial<FileDto> &
	Pick<FileDto, 'formatID' | 'fileHash' | 'size' | 'path' | 'origin'>;
