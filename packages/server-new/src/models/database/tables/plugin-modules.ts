import {
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { Plugins } from './index.js';

export const name = 'PLUGIN_MODULES';

export interface __TableSchema {
	id: Generated<number>;
	plugin_id: number;
	name: string;
	display_name: string;
	description: string | null;
}

export type Selection = Selectable<__TableSchema>;
export type Update = Updateable<__TableSchema>;
export type Insertion = Insertable<__TableSchema>;

export function init(db: Kysely<unknown>) {
	return db.schema
		.createTable(name)
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.notNull().primaryKey().unique())
		.addColumn('plugin_id', 'integer', (cb) =>
			cb.references(`${Plugins.name}.id`).notNull().onUpdate('cascade').onDelete('cascade'),
		)
		.addColumn('name', 'text', (cb) => cb.notNull().unique())
		.addColumn('display_name', 'text', (cb) => cb.notNull())
		.addColumn('description', 'text')
		.execute();
}
