import {
	sql,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type DatabaseSchema } from '../database.js';

export interface Model {
	linkedUserId: number;
	linkedPlatformId: number;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createUserLinkedPlatformTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('UserLinkedPlatform')
		.ifNotExists()
		.addColumn('linkedUserId', 'integer', (cb) =>
			cb
				.notNull()
				.references('User.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('linkedPlatformId', 'integer', (cb) =>
			cb
				.notNull()
				.references('Platform.id')
				.onDelete('cascade')
				.onUpdate('cascade').modifyEnd(sql`,
					UNIQUE(linkedUserId, linkedPlatformId)
				`),
		)
		.execute();
