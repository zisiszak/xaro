import {
	sql,
	type ColumnType,
	type Generated,
	type Insertable,
	type JSONColumnType,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type Database } from '../database.js';

export interface Model {
	readonly id: Generated<number>;
	linkedContentId: number;
	linkedPlatformId: number;
	linkedPlatformProfileId: number | null;
	linkedPlatformCommunityId: number | null;

	sourceId: string | null;
	sourceUrl: string | null;
	sourcePageUrl: string | null;
	sourceMetadataDump: JSONColumnType<
		string[],
		string | null | undefined
	> | null;

	title: string | null;
	description: string | null;
	bodyText: string | null;
	ageLimit: number | null;
	likeCount: number | null;
	dislikeCount: number | null;
	viewCount: number | null;
	commentCount: number | null;
	likeToDislikeRatio: number | null;
	tags: JSONColumnType<string[], string | null | undefined> | null;
	categories: JSONColumnType<string[], string | null | undefined> | null;
	genres: JSONColumnType<string[], string | null | undefined> | null;

	datePublished: ColumnType<
		Date,
		string | null | undefined,
		string | null | undefined
	>;
	/** Most recent modification date, if applicable. */
	dateModified: ColumnType<
		Date,
		string | null | undefined,
		string | null | undefined
	>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createPlatformLinkedMediaTable = (db: Database) =>
	db.schema
		.createTable('PlatformLinkedContent')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('linkedPlatformId', 'integer', (cb) =>
			cb.references('Platform.id').notNull(),
		)
		.addColumn('linkedContentId', 'integer', (cb) =>
			cb.references('Content.id').notNull(),
		)
		.addColumn('linkedPlatformProfileId', 'integer', (cb) =>
			cb.references('PlatformProfile.id'),
		)
		.addColumn('linkedPlatformCommunityId', 'integer', (cb) =>
			cb.references('PlatformCommunity.id'),
		)
		.addColumn('sourceId', 'text')
		.addColumn('sourceUrl', 'text')
		.addColumn('sourcePageUrl', 'text')
		.addColumn('sourceMetadataDump', 'json')
		.addColumn('title', 'text')
		.addColumn('description', 'text')
		.addColumn('bodyText', 'text')
		.addColumn('ageLimit', 'integer')
		.addColumn('likeCount', 'integer')
		.addColumn('dislikeCount', 'integer')
		.addColumn('viewCount', 'integer')
		.addColumn('commentCount', 'integer')
		.addColumn('likeToDislikeRatio', 'real')
		.addColumn('tags', 'json')
		.addColumn('categories', 'json')
		.addColumn('genres', 'json')
		.addColumn('datePublished', 'date')
		.addColumn('dateModified', 'date', (cb) =>
			cb.modifyEnd(sql`,UNIQUE(linkedContentId, linkedPlatformId)`),
		)
		.execute();
