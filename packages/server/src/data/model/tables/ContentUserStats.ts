import {
	sql,
	type ColumnType,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type DatabaseSchema } from '../database.js';

export interface Model {
	linkedUserId: number;
	linkedContentId: number;

	watched: boolean | null;
	playCount: number | null;
	lastPlayed: ColumnType<Date, string | undefined, string> | null;
	playhead: number | null;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createContentUserStatsTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('ContentUserStats')
		.ifNotExists()
		.addColumn('linkedUserId', 'integer', (cb) =>
			cb
				.notNull()
				.references('User.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('linkedContentId', 'integer', (cb) =>
			cb
				.notNull()
				.references('Content.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('watched', 'boolean', (cb) => cb.defaultTo(false))
		.addColumn('playCount', 'integer', (cb) => cb.defaultTo(0))
		.addColumn('lastPlayed', 'timestamp')
		.addColumn('playhead', 'integer', (cb) =>
			cb.modifyEnd(sql`,UNIQUE(linkedUserId, linkedContentId)`),
		)
		.execute();
