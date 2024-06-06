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
	linkedPersonId: number;

	name: string;
	sourceId: string;
	sourceUrl: string | null;

	assets: JSONColumnType<Record<string, string>>;

	displayName: string;
	description: string | null;
	subscribers: number | null;

	dateCreated: ColumnType<Date, string | undefined, string>;

	dateAdded: ColumnType<Date, string | undefined, never>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createPlatformProfileTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('PlatformProfile')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('linkedPlatformId', 'integer', (cb) =>
			cb
				.notNull()
				.references('Platform.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('linkedPersonId', 'integer', (cb) =>
			cb
				.notNull()
				.references('Person.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('sourceId', 'text', (cb) => cb.notNull())
		.addColumn('sourceUrl', 'text')
		.addColumn('displayName', 'text', (cb) => cb.notNull())
		.addColumn('name', 'text', (cb) => cb.notNull())
		.addColumn('description', 'text')
		.addColumn('subscribers', 'integer')
		.addColumn('assets', 'jsonb')
		.addColumn('dateCreated', 'text')
		.addColumn('dateAdded', 'timestamp', (cb) =>
			cb
				.notNull()
				.defaultTo(sql`current_timestamp`)
				.modifyEnd(sql`,UNIQUE(linkedPlatformId, sourceId)`),
		)
		.execute();
