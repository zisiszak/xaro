import { Insertable, Selectable, Updateable, sql } from 'kysely';
import { Database } from '../database.js';

export interface Model {
	linkedContentId: number;
	linkedSortingTagId: number;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export async function createSortingTagLinkedContentTable(db: Database) {
	return db.schema
		.createTable('SortingTagLinkedContent')
		.ifNotExists()
		.addColumn('linkedContentId', 'integer', (cb) =>
			cb
				.references('Content.id')
				.notNull()
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('linkedSortingTagId', 'integer', (cb) =>
			cb
				.references('SortingTag.id')
				.notNull()
				.onDelete('cascade')
				.onUpdate('cascade')
				.modifyEnd(sql`,UNIQUE(linkedContentId, linkedSortingTagId)`),
		)
		.execute();
}
