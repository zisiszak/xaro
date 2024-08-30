import { sql, type Insertable, type Selectable } from 'kysely';
import { UserRepository } from '~/_modules/user/index.js';
import { xaro } from '~/index.js';
import { ContentRepository } from '../index.js';
import { type InsertableUserLinkedContentDto, type UserLinkedContentDto } from './model.js';

export interface Table {
	user_id: number;
	content_id: number;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'USER_LINKED_CONTENT';

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
			.onUpdate('cascade')
			.modifyEnd(sql`,UNIQUE(user_id, content_id)`),
	)
	.compile();

export const findByUserIDandContentID = async (
	userID: number,
	contentID: number,
): Promise<UserLinkedContentDto | undefined> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where((eb) => eb.and([eb('user_id', '=', userID), eb('content_id', '=', contentID)]))
		.executeTakeFirst()
		.then(selectionRowToDto);

export const insert = async (insertionDto: InsertableUserLinkedContentDto): Promise<void> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.onConflict((cb) => cb.doNothing())
		.executeTakeFirst()
		.then(() => {});

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): UserLinkedContentDto;
function selectionRowToDto(row?: Selection | undefined): UserLinkedContentDto | undefined;
function selectionRowToDto(row?: Selection | undefined): UserLinkedContentDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		contentID: row.content_id,
		userID: row.user_id,
	};
}

function insertableDtoToInsertionRow({
	userID: user_id,
	contentID: content_id,
}: InsertableUserLinkedContentDto): Insertion {
	return {
		user_id,
		content_id,
	};
}
