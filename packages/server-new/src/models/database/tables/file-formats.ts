import {
	sql,
	type Generated,
	type Insertable,
	type JSONColumnType,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { xaro } from '~/index.js';

export const name = 'FILE_FORMATS';

export type FileFormatCategoryTag =
	(typeof FileFormatCategoryTagEnum)[keyof typeof FileFormatCategoryTagEnum];
export const FileFormatCategoryTagEnum = {
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

export interface __TableSchema {
	id: Generated<number>;
	name: string;
	acronym: string | null;
	description: string | null;
	category_tag: FileFormatCategoryTag;
	extensions: JSONColumnType<string[]>;
}

export type Selection = Selectable<__TableSchema>;
export type Update = Updateable<__TableSchema>;
export type Insertion = Insertable<__TableSchema>;

export async function init(db: Kysely<unknown>) {
	return db.schema
		.createTable(name)
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.notNull().primaryKey().unique())
		.addColumn('name', 'text', (cb) => cb.notNull().unique())
		.addColumn('acronym', 'text', (cb) => cb.unique())
		.addColumn('description', 'text')
		.addColumn('category_tag', 'integer', (cb) => cb.notNull())
		.addColumn('extensions', 'json', (cb) =>
			cb.notNull().modifyEnd(sql`,
				CHECK(
					category_tag in (${Object.values(FileFormatCategoryTagEnum)})
				)
			`),
		)
		.execute();
}

export async function insertDefaultEntries(): Promise<undefined> {
	return xaro.db
		.insertInto(name)
		.values([
			// IMAGE
			{
				name: 'Portable Network Graphic',
				acronym: 'PNG',
				extensions: JSON.stringify(['.png']),
				category_tag: FileFormatCategoryTagEnum.Image,
			},
			{
				name: 'Joint Photographic Experts Group',
				acronym: 'JPEG',
				extensions: JSON.stringify(['.jpeg', '.jpg']),
				category_tag: FileFormatCategoryTagEnum.Image,
			},
			{
				name: 'Graphical Interchange Format',
				acronym: 'GIF',
				extensions: JSON.stringify(['.gif']),
				category_tag: FileFormatCategoryTagEnum.Image,
			},
			{
				name: 'AV1 Image File Format',
				acronym: 'AVIF',
				extensions: JSON.stringify(['.avif']),
				category_tag: FileFormatCategoryTagEnum.Image,
			},
			{
				name: 'WebP',
				extensions: JSON.stringify(['.webp']),
				category_tag: FileFormatCategoryTagEnum.Image,
			},
			{
				name: 'High Efficiency Image Format',
				extensions: JSON.stringify(['.heif', '.heic']),
				category_tag: FileFormatCategoryTagEnum.Image,
			},

			// VIDEO
			{
				name: 'MP4',
				extensions: JSON.stringify(['.mp4']),
				category_tag: FileFormatCategoryTagEnum.Video,
			},
			{
				name: 'QuickTime File Format',
				acronym: 'QTFF',
				extensions: JSON.stringify(['.qt', '.mov']),
				category_tag: FileFormatCategoryTagEnum.Video,
			},
			{
				name: 'WebM',
				extensions: JSON.stringify(['.webm']),
				category_tag: FileFormatCategoryTagEnum.Video,
			},
			{
				name: 'Audio Video Interleave',
				acronym: 'AVI',
				extensions: JSON.stringify(['.avi']),
				category_tag: FileFormatCategoryTagEnum.Video,
			},
			{
				name: 'Video Transport Stream',
				acronym: 'TS',
				extensions: JSON.stringify(['.ts']),
				category_tag: FileFormatCategoryTagEnum.Video,
			},
			{
				name: 'Matroska Video',
				acronym: 'MKV',
				extensions: JSON.stringify(['.mkv']),
				category_tag: FileFormatCategoryTagEnum.Video,
			},
		])
		.onConflict((cb) => cb.doNothing())
		.execute()
		.then(() => undefined);
}
