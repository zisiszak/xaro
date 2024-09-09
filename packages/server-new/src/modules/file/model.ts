import { type FileFormatMetadata } from '../file-format/model.js';

export type FileMetadata = FileFormatMetadata & {
	originalFilename?: string | null;
};
