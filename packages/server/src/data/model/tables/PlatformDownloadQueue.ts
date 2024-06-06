// import { createGuard } from 'is-guard';
// import {
// 	sql,
// 	type ColumnType,
// 	type Generated,
// 	type Insertable,
// 	type JSONColumnType,
// 	type Selectable,
// 	type Updateable,
// } from 'kysely';
// import { isUrl } from '../../../utils/strings/format-urls.js';
// import { type Database } from '../database.js';

// // export type ExtractorMatchKind = 'srcUrl' | 'pageUrl';

// export type SourceOptionsBase<K extends ExtractorKind> = {
// 	extractor: K;
// };

// export const isSourceOptionsBase = createGuard.objectWithProps<
// 	SourceOptionsBase<ExtractorKind>
// >({
// 	required: {
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
// 		extractor: (v): v is ExtractorKind => extractorKinds.includes(v as any),
// 	},
// });

// export interface BasicImageDownloadSourceOptions
// 	extends SourceOptionsBase<'basic-image-download'> {
// 	sourceUrl: string;
// 	pageUrl?: string;
// }
// export const isBasicImageDownloadSourceOptions =
// 	createGuard.objectWithProps<BasicImageDownloadSourceOptions>({
// 		required: {
// 			extractor: (v): v is 'basic-image-download' =>
// 				v === 'basic-image-download',
// 			sourceUrl: isUrl,
// 		},
// 		optional: {
// 			pageUrl: isUrl,
// 		},
// 	});

// export interface YtdlpSourceOptions extends SourceOptionsBase<'yt-dlp'> {
// 	sourceKind: 'video' | 'playlist';
// 	sourceUrl?: string;
// 	pageUrl: string;
// }
// export const isYtdlpSourceOptions =
// 	createGuard.objectWithProps<YtdlpSourceOptions>({
// 		required: {
// 			extractor: (v): v is 'yt-dlp' => v === 'yt-dlp',
// 			sourceKind: (v): v is 'video' | 'playlist' =>
// 				v === 'video' || v === 'playlist',
// 			pageUrl: isUrl,
// 		},
// 		optional: {
// 			sourceUrl: isUrl,
// 		},
// 	});

// export type DownloadSourceOptions =
// 	| BasicImageDownloadSourceOptions
// 	| YtdlpSourceOptions;

// export interface Model {
// 	id: Generated<number>;

// 	/** The userId that queued the download */
// 	linkedUserId: number;

// 	linkedPluginId: number;

// 	data: JSONColumnType<any>;

// 	dateAdded: ColumnType<string, string | undefined, never>;
// }

// export type Selection = Selectable<Model>;
// export type Insertion = Insertable<Model>;
// export type Update = Updateable<Model>;

// export const createPlatformDownloadQueueTable = (db: Database) =>
// 	db.schema
// 		.createTable('PlatformDownloadQueue')
// 		.ifNotExists()
// 		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
// 		.addColumn('linkedUserId', 'integer', (cb) =>
// 			cb.notNull().references('User.id'),
// 		)
// 		.addColumn('linkedPluginId', 'integer', (cb) => cb.notNull())
// 		.addColumn('data', 'json', (cb) => cb.notNull())
// 		.addColumn('dateAdded', 'timestamp', (cb) =>
// 			cb.notNull().defaultTo(sql`current_timestamp`).modifyEnd(sql`,
// 				UNIQUE(linkedUserId, data)`),
// 		)
// 		.execute();
