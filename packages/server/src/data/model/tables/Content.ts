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
import { type ContentKind } from '../shared/content-kinds.js';

export interface Model {
	readonly id: Generated<number>;
	readonly kind: ContentKind;
	readonly dateAdded: ColumnType<Date, string | undefined, never> | null;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createContentTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('Content')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('kind', 'text', (cb) => cb.notNull())
		.addColumn('dateAdded', 'timestamp', (cb) =>
			cb.defaultTo(sql`current_timestamp`),
		)
		.execute();
