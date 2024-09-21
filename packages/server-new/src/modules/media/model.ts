import { type Selectable } from 'kysely';
import { type TableSelection } from '~/modules/database.schema.js';
import { type MediaTableSchema } from './sqlite.table.js';

export interface FullMediaRecord extends Selectable<MediaTableSchema> {
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
