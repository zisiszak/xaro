import {
	sql,
	type ColumnType,
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type DatabaseSchema } from '../database.js';

export interface Model {
	id: Generated<number>;
	name: string;
	linkedUserId: number | null;
	dateAdded: ColumnType<Date, string | undefined, never>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createGroupingPlaylistTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('GroupingPlaylist')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('name', 'text', (cb) => cb.notNull())
		.addColumn('linkedUserId', 'integer', (cb) =>
			cb
				.references('User.id')
				.onDelete('cascade')
				.onUpdate('cascade')
				.defaultTo(null),
		)
		.addColumn('dateAdded', 'timestamp', (cb) =>
			cb.notNull().defaultTo(sql`current_timestamp`),
		)
		.execute();
