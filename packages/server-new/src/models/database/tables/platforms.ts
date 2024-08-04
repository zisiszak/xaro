import {
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';

export const name = 'PLATFORMS';

export interface __TableSchema {
	id: Generated<number>;
	platform_manager_plugin_module_id: number | null;
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
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('home_url', 'text', (cb) => cb.notNull())
		.addColumn('display_name', 'text', (cb) => cb.notNull())
		.addColumn('description', 'text')
		.execute();
}
