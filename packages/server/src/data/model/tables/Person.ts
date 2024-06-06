import {
	sql,
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { logger } from '~/index.js';
import { __coreParams } from '../../../config/core-params.js';
import { type DatabaseSchema } from '../database.js';

export interface Model {
	id: Generated<number>;
	firstAssociatedPlatformId: number | null;

	name: string;

	displayName: string | null;
	description: string | null;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createPersonTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('Person')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('firstAssociatedPlatformId', 'integer', (cb) =>
			cb
				.references('Platform.id')
				.onDelete('restrict')
				.onUpdate('cascade')
				.defaultTo(null),
		)
		.addColumn('displayName', 'text')
		.addColumn('name', 'text', (cb) =>
			cb.notNull().unique().modifyEnd(sql`,
		UNIQUE(firstAssociatedPlatformId, name)
		`),
		)
		.execute()
		.then(() =>
			db
				.insertInto('Person')
				.values(__coreParams.defaultPerson)
				.onConflict((cb) => cb.doNothing())
				.execute()
				.catch((err) => {
					logger.error(err, 'Failed to insert default creator');
				}),
		);
