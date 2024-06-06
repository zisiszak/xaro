import {
	type ColumnType,
	type Generated,
	type Insertable,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type BoolishInt } from '../../../utils/types-and-guards/index.js';
import { type Database } from '../database.js';

export interface Model {
	id: Generated<number>;

	name: string;

	version: string;

	displayName: string;

	description: string | null;

	isEnabled: ColumnType<BoolishInt | null, BoolishInt, BoolishInt>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export async function createPluginTable(db: Database) {
	return db.schema
		.createTable('Plugin')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('name', 'text', (cb) => cb.notNull().unique())
		.addColumn('version', 'text', (cb) => cb.notNull())
		.addColumn('displayName', 'text', (cb) => cb.notNull())
		.addColumn('description', 'text')
		.addColumn('isEnabled', 'integer', (cb) => cb.notNull().defaultTo(1))
		.execute();
}
