import { type Insertable, type Selectable, sql } from 'kysely';
import { UserRepository } from '~/_modules/user/index.js';
import { xaro } from '~/index.js';
import { PlatformProfileRepository } from '../platform-profile/index.js';
import {
	type InsertableUserLinkedPlatformProfileDto,
	type UserLinkedPlatformProfileDto,
} from './model.js';

export const TABLE_NAME = 'USER_LINKED_PLATFORM_PROFILES';

export interface Table {
	platform_profile_id: number;
	user_id: number;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('platform_profile_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${PlatformProfileRepository.TABLE_NAME}.id`)
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

export const insert = async (
	insertableDto: InsertableUserLinkedPlatformProfileDto,
): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertableDto))
		.executeTakeFirst()
		.then((result) => Number(result.insertId));

export const checkLink = async (userID: number, platformProfileID: number): Promise<boolean> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where((eb) =>
			eb.and([eb('user_id', '=', userID), eb('platform_profile_id', '=', platformProfileID)]),
		)
		.executeTakeFirst()
		.then(Boolean);

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): UserLinkedPlatformProfileDto;
function selectionRowToDto(row?: Selection | undefined): UserLinkedPlatformProfileDto | undefined;
function selectionRowToDto(row?: Selection | undefined): UserLinkedPlatformProfileDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		userID: row.user_id,
		platformProfileID: row.platform_profile_id,
	};
}

function insertableDtoToInsertionRow({
	userID: user_id,
	platformProfileID: platform_profile_id,
}: InsertableUserLinkedPlatformProfileDto): Insertion {
	return {
		user_id,
		platform_profile_id,
	};
}
