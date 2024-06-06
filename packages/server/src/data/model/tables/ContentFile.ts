import {
	sql,
	type ColumnType,
	type Generated,
	type Insertable,
	type JSONColumnType,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type ContentFileCategory } from '../../../exports.js';
import { type BoolishInt } from '../../../utils/types-and-guards/index.js';
import { type DatabaseSchema } from '../database.js';
import { type ContentFileExtension } from '../shared/content-kinds.js';

export interface Model {
	id: Generated<number>;
	/**
	 * @description The associated media item ID.
	 *
	 * @important The linked media item cannot be an alias. It must link to the original media item. This is to ensure that the media file can always be indexed using the original media item.
	 */
	linkedContentId: number;

	/** relative to the media directory (so as to be served statically, and irrespective of library dir being moved) */
	path: string;
	/** with leading `.` */
	extension: ContentFileExtension;
	category: ContentFileCategory;
	/** in bytes */
	size: number;
	hash: string;

	width: number | null;
	height: number | null;
	bitrate: number | null;
	framerate: number | null | string;
	duration: number | null;
	timestamp: string | null;
	trimIn: string | null;
	trimOut: string | null;
	originalFilename: string | null;
	sourceUrl: string | null;

	label: string | null;
	dateAdded: ColumnType<Date, string | undefined, never>;

	extractedMetadata: JSONColumnType<object> | null;

	removed: ColumnType<BoolishInt, BoolishInt | null, 1>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createMediaFileTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('ContentFile')
		.ifNotExists()
		.addColumn('linkedContentId', 'integer', (cb) =>
			cb
				.notNull()
				.references('Content.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('path', 'text', (cb) => cb.notNull().unique())
		.addColumn('extension', 'text', (cb) => cb.notNull())
		.addColumn('category', 'integer')
		.addColumn('size', 'integer', (cb) => cb.notNull())
		.addColumn('label', 'text')
		.addColumn('hash', 'text', (cb) => cb.unique().notNull())
		.addColumn('width', 'integer')
		.addColumn('height', 'integer')
		.addColumn('originalFilename', 'text')
		.addColumn('sourceUrl', 'text')
		.addColumn('bitrate', 'integer')
		.addColumn('framerate', 'real')
		.addColumn('duration', 'integer')
		.addColumn('timestamp', 'text')
		.addColumn('trimIn', 'text')
		.addColumn('trimOut', 'text')
		.addColumn('extractedMetadata', 'text')
		.addColumn('dateAdded', 'timestamp', (cb) =>
			cb.notNull().defaultTo(sql`current_timestamp`),
		)
		.addColumn('removed', 'integer', (cb) =>
			cb.defaultTo(0).notNull().modifyEnd(sql`,
			CHECK(size >= 0),
			CHECK(
				(width >= 0)
				OR width IS NULL
			),
			CHECK(
				(height >= 0)
				OR height IS NULL
			),
			CHECK(
				(bitrate >= 0)
				OR bitrate IS NULL
			),
			CHECK(
				(duration >= 0)
				OR duration IS NULL
			),
			CHECK(
				(framerate >= 0)
				OR framerate IS NULL
			)
		`),
		)
		.execute();
