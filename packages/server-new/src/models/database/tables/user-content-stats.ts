import { type Insertable, type Kysely, type Selectable, type Updateable } from 'kysely';
import { Content, Users } from './index.js';

export const name = 'USER_CONTENT_STATS';

export interface __TableSchema {
	user_id: number;
	content_id: number;
	seen: int_bool;
	play_count: number | null;
	last_playhead: number | null;
	date_last_played: number | null;
	favourite: int_bool;
	/** [0, 100], a percentage rating */
	rating: number | null;
}

export type Selection = Selectable<__TableSchema>;
export type Update = Updateable<__TableSchema>;
export type Insertion = Insertable<__TableSchema>;

export async function init(db: Kysely<unknown>) {
	return db.schema
		.createTable(name)
		.ifNotExists()
		.addColumn('user_id', 'integer', (cb) =>
			cb.notNull().references(`${Users.name}.id`).onDelete('cascade').onUpdate('cascade'),
		)
		.addColumn('content_id', 'integer', (cb) =>
			cb.notNull().references(`${Content.name}.id`).onDelete('cascade').onUpdate('cascade'),
		)
		.addColumn('seen', 'boolean', (cb) => cb.notNull().defaultTo(0))
		.addColumn('play_count', 'integer', (cb) => cb.defaultTo(null))
		.addColumn('last_playhead', 'integer', (cb) => cb.defaultTo(null))
		.addColumn('date_last_played', 'integer', (cb) => cb.defaultTo(null))
		.addColumn('favourite', 'boolean', (cb) => cb.defaultTo(0).notNull())
		.addColumn('rating', 'real', (cb) => cb.defaultTo(null))
		.execute();
}
