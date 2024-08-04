import { type GenericError, newError } from 'exitus';
import {
	type ColumnType,
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	sql,
	type Updateable,
} from 'kysely';
import { xaro } from '~/index.js';
import { type DateAddedColumn } from '~/utils/types.js';
import { Users } from './index.js';

export const name = 'CONTENT';

export interface __TableSchema {
	id: Generated<number>;
	owner_id: number;
	date_added: DateAddedColumn;
	is_private: ColumnType<int_bool, int_bool, int_bool>;
	is_hidden: ColumnType<int_bool, int_bool | undefined, int_bool>;
	marked_for_removal: ColumnType<int_bool, undefined, int_true>;
}

export type Selection = Selectable<__TableSchema>;
export type Update = Updateable<__TableSchema>;
export type Insertion = Insertable<__TableSchema>;

export async function init(db: Kysely<unknown>) {
	return db.schema
		.createTable(name)
		.addColumn('id', 'integer', (cb) => cb.notNull().unique().primaryKey())
		.addColumn('owner_id', 'integer', (cb) =>
			cb.references(`${Users.name}.id`).notNull().onDelete('cascade').onUpdate('cascade'),
		)
		.addColumn('date_added', 'integer', (cb) => cb.defaultTo(sql`unixepoch('now')`).notNull())
		.addColumn('is_private', 'boolean', (cb) => cb.notNull().defaultTo(1))
		.addColumn('is_hidden', 'boolean', (cb) => cb.defaultTo(0))
		.addColumn('marked_for_removal', 'boolean', (cb) =>
			cb.defaultTo(0).notNull().modifyEnd(sql`,
			UNIQUE(owner_id, content_id)
		`),
		)
		.execute();
}

/**
 *
 * @returns {Promise<number>} A promise that resolves with number ID of the newly created entry.
 */
export async function insert({
	ownerID,
	isPrivate,
}: {
	ownerID: number;
	isPrivate: boolean;
}): Promise<number | GenericError> {
	return xaro.db
		.insertInto(name)
		.values({
			owner_id: ownerID,
			is_private: isPrivate ? 1 : 0,
		})
		.executeTakeFirstOrThrow()
		.then((result) => Number(result))
		.catch((err) =>
			newError({
				caughtException: err,
				message: 'Failed to create a new Content table database entry.',
				log: 'error',
			}),
		);
}

export async function readEntryWhereID(contentID: number): Promise<Selection | undefined> {
	return xaro.db.selectFrom(name).selectAll().where('id', '=', contentID).executeTakeFirst();
}
