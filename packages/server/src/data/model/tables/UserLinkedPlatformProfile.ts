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
	linkedPlatformProfileId: number;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createUserLinkedPlatformProfileTable = (
	db: Kysely<DatabaseSchema>,
) =>
	db.schema
		.createTable('UserLinkedPlatformProfile')
		.ifNotExists()
		.addColumn('linkedUserId', 'integer', (cb) =>
			cb
				.notNull()
				.references('User.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('linkedPlatformProfileId', 'integer', (cb) =>
			cb
				.notNull()
				.references('PlatformProfile.id')
				.onDelete('cascade')
				.onUpdate('cascade')
				.modifyEnd(
					sql`,
				UNIQUE(linkedUserId, linkedPlatformProfileId)`,
				),
		)
		.execute();
