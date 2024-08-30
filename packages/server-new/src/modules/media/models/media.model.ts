import { type TableSelection } from '~/modules/database.schema.js';

export interface MediaFilesRecord {
	media?: TableSelection<'File'>[];
	thumbnail?: TableSelection<'File'>[];
	videoPreview?: TableSelection<'File'>[];
	subtitles?: TableSelection<'File'>[];
	metadata?: TableSelection<'File'>[];
	dump?: TableSelection<'File'>[];
}

export type MediaSourceRecord = TableSelection<'PlatformMediaSource'> | Record<string, never>;

export type MediaRecord = TableSelection<'Media'>;
export interface ExtensiveMediaRecord extends MediaRecord {
	source: MediaSourceRecord;
	sorting: {
		tags: string[];
	};
	files: MediaFilesRecord;
}
