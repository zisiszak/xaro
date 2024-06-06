import {
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
	displayName: string;
	linkedUserId: number | null;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createSortingTagTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('SortingTag')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('name', 'text', (cb) => cb.notNull())
		.addColumn('displayName', 'text', (cb) => cb.notNull())
		.addColumn('linkedUserId', 'integer', (cb) =>
			cb
				.references('User.id')
				.onDelete('cascade')
				.onUpdate('cascade')
				.defaultTo(null),
		)
		.execute();
