import { type Insertable, type Selectable, sql } from 'kysely';
import { UserRepository } from '~/_modules/user/index.js';
import { xaro } from '~/index.js';
import { PlatformCommunityRepository } from '../platform-community/index.js';
import {
	type InsertableUserLinkedPlatformCommunityDto,
	type UserLinkedPlatformCommunityDto,
} from './model.js';

export const TABLE_NAME = 'USER_LINKED_PLATFORM_COMMUNITIES';

export interface Table {
	platform_community_id: number;
	user_id: number;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('platform_community_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${PlatformCommunityRepository.TABLE_NAME}.id`)
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
	insertableDto: InsertableUserLinkedPlatformCommunityDto,
): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertableDto))
		.executeTakeFirst()
		.then((result) => Number(result.insertId));

export const checkLink = async (userID: number, platformCommunityID: number): Promise<boolean> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where((eb) =>
			eb.and([
				eb('user_id', '=', userID),
				eb('platform_community_id', '=', platformCommunityID),
			]),
		)
		.executeTakeFirst()
		.then(Boolean);

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): UserLinkedPlatformCommunityDto;
function selectionRowToDto(row?: Selection | undefined): UserLinkedPlatformCommunityDto | undefined;
function selectionRowToDto(
	row?: Selection | undefined,
): UserLinkedPlatformCommunityDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		userID: row.user_id,
		platformCommunityID: row.platform_community_id,
	};
}

function insertableDtoToInsertionRow({
	userID: user_id,
	platformCommunityID: platform_community_id,
}: InsertableUserLinkedPlatformCommunityDto): Insertion {
	return {
		user_id,
		platform_community_id,
	};
}
