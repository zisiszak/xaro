import { type TableSelection } from '~/modules/database.schema.js';

export type MediaRecord = TableSelection<'Media'>;

export interface UserToMediaRecord {
	userID: number;
	mediaID: number;
}

export interface FileToMediaRecord {
	mediaID: number;
	originalFileID: number;
}

export interface ExtensiveMediaRecord extends MediaRecord {
	source: MediaSourceRecord;
	sorting: {
		tags: string[];
	};
	files: MediaFilesRecord;
}

export interface MediaFilesRecord {
	media?: TableSelection<'File'>[];
	thumbnail?: TableSelection<'File'>[];
	videoPreview?: TableSelection<'File'>[];
	subtitles?: TableSelection<'File'>[];
	metadata?: TableSelection<'File'>[];
	dump?: TableSelection<'File'>[];
}

export type MediaSourceRecord = TableSelection<'PlatformMediaSource'> | Record<string, never>;
