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
	linkedPlatformCommunityId: number;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createUserLinkedPlatformCommunityTable = (
	db: Kysely<DatabaseSchema>,
) =>
	db.schema
		.createTable('UserLinkedPlatformCommunity')
		.ifNotExists()
		.addColumn('linkedUserId', 'integer', (cb) =>
			cb
				.notNull()
				.references('User.id')
				.onDelete('cascade')
				.onUpdate('cascade'),
		)
		.addColumn('linkedPlatformCommunityId', 'integer', (cb) =>
			cb
				.notNull()
				.references('PlatformCommunity.id')
				.onDelete('cascade')
				.onUpdate('cascade')
				.modifyEnd(
					sql`,
				UNIQUE(linkedUserId, linkedPlatformCommunityId)`,
				),
		)
		.execute();
