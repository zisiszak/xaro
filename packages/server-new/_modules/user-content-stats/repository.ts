import { sql, type ColumnType, type Insertable, type Selectable } from 'kysely';
import { ContentRepository, UserRepository } from '~/_modules/index.js';
import { xaro } from '~/index.js';
import { parseIntBool, toIntBool } from '~/utils/int-bool.js';
import { type InsertableUserContentStatsDto, type UserContentStatsDto } from './model.js';

export interface Table {
	user_id: number;
	content_id: number;
	has_been_seen: ColumnType<IntBool, IntBool | undefined>;
	play_count: ColumnType<number, number | undefined>;
	last_playhead: ColumnType<number | null, number | null | undefined>;
	date_last_played: ColumnType<number | null, number | null | undefined>;
	is_favourite: ColumnType<IntBool, IntBool | undefined>;
	rating: ColumnType<number | null, number | null | undefined>;
}
type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'USER_CONTENT_STATS';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('user_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${UserRepository.TABLE_NAME}.id`)
			.onDelete('cascade')
			.onUpdate('cascade'),
	)
	.addColumn('content_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${ContentRepository.TABLE_NAME}.id`)
			.onDelete('cascade')
			.onUpdate('cascade'),
	)
	.addColumn('has_been_seen', 'boolean', (cb) => cb.notNull().defaultTo(0))
	.addColumn('play_count', 'integer', (cb) => cb.defaultTo(null))
	.addColumn('last_playhead', 'integer', (cb) => cb.defaultTo(null))
	.addColumn('date_last_played', 'integer', (cb) => cb.defaultTo(null))
	.addColumn('is_favourite', 'boolean', (cb) => cb.defaultTo(0).notNull())
	.addColumn('rating', 'integer', (cb) =>
		cb.defaultTo(null).modifyEnd(sql`,
	UNIQUE(
		user_id, content_id
	)`),
	)
	.compile();

export const findByUserIDandContentID = async (
	userID: number,
	contentID: number,
): Promise<UserContentStatsDto | undefined> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where((eb) => eb.and([eb('user_id', '=', userID), eb('content_id', '=', contentID)]))
		.executeTakeFirst()
		.then(selectionRowToDto);

export const insert = async (insertionDto: InsertableUserContentStatsDto): Promise<void> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.onConflict((cb) => cb.doNothing())
		.executeTakeFirst()
		.then(() => {});

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): UserContentStatsDto;
function selectionRowToDto(row?: Selection | undefined): UserContentStatsDto | undefined;
function selectionRowToDto(row?: Selection | undefined): UserContentStatsDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		contentID: row.content_id,
		userID: row.user_id,
		dateLastPlayed: row.date_last_played !== null ? new Date(row.date_last_played) : null,
		hasBeenSeen: parseIntBool(row.has_been_seen),
		isFavourite: parseIntBool(row.is_favourite),
		lastPlayhead: row.last_playhead,
		playCount: row.play_count,
		rating: row.rating,
	};
}

function insertableDtoToInsertionRow({
	userID: user_id,
	contentID: content_id,
	dateLastPlayed,
	hasBeenSeen,
	isFavourite,
	lastPlayhead: last_playhead,
	playCount: play_count,
	rating,
}: InsertableUserContentStatsDto): Insertion {
	return {
		user_id,
		content_id,
		last_playhead,
		play_count,
		rating,
		date_last_played: dateLastPlayed?.getSeconds(),
		has_been_seen: typeof hasBeenSeen === 'boolean' ? toIntBool(hasBeenSeen) : undefined,
		is_favourite: typeof isFavourite === 'boolean' ? toIntBool(isFavourite) : undefined,
	};
}
