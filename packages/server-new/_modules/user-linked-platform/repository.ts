import { type Insertable, type Selectable, sql } from 'kysely';
import { UserRepository } from '~/_modules/user/index.js';
import { xaro } from '~/index.js';
import { PlatformRepository } from '../platform/index.js';
import { type InsertableUserLinkedPlatformDto, type UserLinkedPlatformDto } from './model.js';

export interface Table {
	platform_id: number;
	user_id: number;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'USER_LINKED_PLATFORMS';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('platform_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${PlatformRepository.TABLE_NAME}.id`)
			.onDelete('restrict')
			.onUpdate('restrict'),
	)
	.addColumn('user_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${UserRepository.TABLE_NAME}.id`)
			.onUpdate('cascade')
			.onDelete('cascade')
			.modifyEnd(sql`, UNIQUE(platform_community_id, user_id)`),
	)
	.compile();

export const insert = async (insertableDto: InsertableUserLinkedPlatformDto): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertableDto))
		.executeTakeFirst()
		.then((result) => Number(result.insertId));

export const checkLink = async (userID: number, platformID: number): Promise<boolean> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where((eb) => eb.and([eb('user_id', '=', userID), eb('platform_id', '=', platformID)]))
		.executeTakeFirst()
		.then(Boolean);

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): UserLinkedPlatformDto;
function selectionRowToDto(row?: Selection | undefined): UserLinkedPlatformDto | undefined;
function selectionRowToDto(row?: Selection | undefined): UserLinkedPlatformDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		userID: row.user_id,
		platformID: row.platform_id,
	};
}

function insertableDtoToInsertionRow({
	userID: user_id,
	platformID: platform_id,
}: UserLinkedPlatformDto): Insertion {
	return {
		user_id,
		platform_id,
	};
}
