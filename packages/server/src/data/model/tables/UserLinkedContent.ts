import {
	sql,
	type ColumnType,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type BoolishInt } from '../../../utils/types-and-guards/index.js';
import { type DatabaseSchema } from '../database.js';

export const custom_title_max_length = 100;
export const custom_description_max_length = 500;
export const ratings = [1, 2, 3, 4, 5] as const;
export type Rating = (typeof ratings)[number];

export interface Model {
	linkedUserId: number;
	linkedContentId: number;

	customTitle: string | null;
	customDescription: string | null;

	preferredThumbnailId: number | null;

	isFavourite: ColumnType<
		BoolishInt,
		BoolishInt | null | undefined,
		BoolishInt
	>;
	watchLater: ColumnType<
		BoolishInt,
		BoolishInt | null | undefined,
		BoolishInt
	>;
	rating: ColumnType<Rating | null, Rating | null | undefined, Rating | null>;

	/** Only hidden for the user. If the media is not private to the user, then this does not mean it is hidden for others. */
	isHidden: ColumnType<BoolishInt, BoolishInt | null | undefined, BoolishInt>;

	isPublic: ColumnType<BoolishInt, BoolishInt | null | undefined, BoolishInt>;

	isRemoved: ColumnType<
		BoolishInt,
		BoolishInt | null | undefined,
		BoolishInt
	>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createUserContentTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('UserLinkedContent')
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
		.addColumn('customTitle', 'text')
		.addColumn('customDescription', 'text')
		.addColumn('preferredThumbnailId', 'integer', (cb) =>
			cb
				.references('ContentFile.id')
				.onDelete('set null')
				.onUpdate('cascade'),
		)
		.addColumn('isFavourite', 'integer', (cb) => cb.defaultTo(0).notNull())
		.addColumn('watchLater', 'integer', (cb) => cb.defaultTo(0).notNull())
		.addColumn('rating', 'integer', (cb) => cb.defaultTo(null))
		.addColumn('isHidden', 'integer', (cb) => cb.defaultTo(0).notNull())
		.addColumn('isPublic', 'integer', (cb) => cb.defaultTo(0).notNull())
		.addColumn('isRemoved', 'integer', (cb) =>
			cb.defaultTo(0).modifyEnd(
				sql`,
			UNIQUE(linkedUserId, linkedContentId)`,
			),
		)
		.execute();
