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
import { type DatabaseSchema } from '../database.js';
export interface Model {
	id: Generated<number>;
	linkedPlatformId: number;
	displayName: string;
	name: string;
	sourceId: string;
	sourceUrl: string | null;

	assets: JSONColumnType<any>;

	description: string | null;
	subtitle: string | null;
	subscribers: number | null;
	dateCreated: ColumnType<Date, string | undefined, string>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createPlatformCommunityTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('PlatformCommunity')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('linkedPlatformId', 'integer', (cb) =>
			cb
				.notNull()
				.references('Platform.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('displayName', 'text', (cb) => cb.notNull())
		.addColumn('name', 'text', (cb) => cb.notNull())
		.addColumn('sourceId', 'text', (cb) => cb.notNull())
		.addColumn('description', 'text')
		.addColumn('subtitle', 'text')
		.addColumn('subscribers', 'integer')
		.addColumn('sourceUrl', 'text')
		.addColumn('assets', 'json')
		.addColumn('dateCreated', 'timestamp', (cb) =>
			cb.modifyEnd(sql`,UNIQUE(linkedPlatformId, sourceId)`),
		)
		.execute();
