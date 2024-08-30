import { sql, type Generated, type Insertable, type JSONColumnType, type Selectable } from 'kysely';
import { PlatformRepository } from '~/_modules/index.js';
import { xaro } from '~/index.js';
import { Creators } from '~/models/database/tables/index.js';
import { type DateAddedColumn } from '~/utils/types.js';
import { type InsertablePlatformProfileDto, type PlatformProfileDto } from './model.js';

export interface Table {
	id: Generated<number>;
	platform_id: number;
	creator_id: number;
	name: string;
	sourceid: string;
	source_url: string;
	display_name: string;
	description: string | null;
	metadata: JSONColumnType<any, string | undefined | null>;
	date_added: DateAddedColumn;
}
type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'PLATFORM_PROFILES';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('id', 'integer', (cb) => cb.notNull().unique().primaryKey())
	.addColumn('name', 'text', (cb) => cb.notNull().unique())
	.addColumn('platform_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${PlatformRepository.TABLE_NAME}.id`)
			.onDelete('restrict')
			.onUpdate('cascade'),
	)
	.addColumn('creator_id', 'integer', (cb) =>
		cb.notNull().references(`${Creators.name}.id`).onDelete('restrict').onUpdate('cascade'),
	)
	.addColumn('sourceid', 'text', (cb) => cb.notNull())
	.addColumn('source_url', 'text', (cb) => cb.notNull().unique())
	.addColumn('display_name', 'text', (cb) => cb.notNull())
	.addColumn('description', 'text')
	.addColumn('metadata', 'json', (cb) => cb.notNull())
	.addColumn('date_added', 'integer', (cb) =>
		cb.defaultTo(sql`unixepoch('now')`).notNull().modifyEnd(sql`,
				UNIQUE(platform_id, sourceid),
			`),
	)
	.compile();

export const findByID = async (id: number) =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then(selectionRowToDto);

export const findByName = async (name: string) =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('name', '=', name)
		.executeTakeFirst()
		.then(selectionRowToDto);

export const insert = async (insertableDto: InsertablePlatformProfileDto): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertableDto))
		.executeTakeFirst()
		.then((result) => Number(result.insertId));

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): PlatformProfileDto;
function selectionRowToDto(row?: Selection | undefined): PlatformProfileDto | undefined;
function selectionRowToDto(row?: Selection | undefined): PlatformProfileDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		id: row.id,
		creatorID: row.creator_id,
		dateAdded: new Date(row.date_added),
		description: row.description,
		displayName: row.display_name,
		name: row.name,
		platformID: row.platform_id,
		sourceId: row.sourceid,
		metadata: row.metadata as object | Array<unknown> | null,
		sourceUrl: row.source_url,
	};
}

function insertableDtoToInsertionRow({
	creatorID: creator_id,
	sourceId: sourceid,
	platformID: platform_id,
	sourceUrl: source_url,
	metadata,
	name,
	displayName: display_name,
	description,
}: InsertablePlatformProfileDto): Insertion {
	return {
		creator_id,
		sourceid,
		source_url,
		platform_id,
		metadata: metadata ? JSON.stringify(metadata) : null,
		name,
		display_name,
		description,
	};
}
