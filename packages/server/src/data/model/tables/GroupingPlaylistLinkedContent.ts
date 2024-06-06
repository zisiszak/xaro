import {
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type DatabaseSchema } from '../database.js';

export interface Model {
	linkedGroupingPlaylistId: number;
	linkedContentId: number;
	order: number;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createGroupingPlaylistLinkedContentTable = (
	db: Kysely<DatabaseSchema>,
) =>
	db.schema
		.createTable('GroupingPlaylistLinkedContent')
		.ifNotExists()
		.addColumn('linkedGroupingPlaylistId', 'integer', (cb) =>
			cb
				.notNull()
				.references('GroupingPlaylist.id')
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
		.addColumn('order', 'integer')
		.execute();
