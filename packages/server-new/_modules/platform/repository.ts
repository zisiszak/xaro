import { type Generated, type Insertable, type Selectable } from 'kysely';
import { xaro } from '~/index.js';
import { type InsertablePlatformDto, type PlatformDto } from './model.js';

export interface Table {
	id: Generated<number>;
	name: string;
	display_name: string;
	home_url: string;
	description: string | null;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'PLATFORMS';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique().autoIncrement())
	.addColumn('name', 'text', (cb) => cb.notNull().unique())
	.addColumn('home_url', 'text', (cb) => cb.notNull())
	.addColumn('display_name', 'text', (cb) => cb.notNull())
	.addColumn('description', 'text')
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

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): PlatformDto;
function selectionRowToDto(row?: Selection | undefined): PlatformDto | undefined;
function selectionRowToDto(row?: Selection | undefined): PlatformDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		description: row.description,
		displayName: row.display_name,
		homeUrl: row.home_url,
		id: row.id,
		name: row.name,
	};
}

export const insert = async (insertableDto: InsertablePlatformDto): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertableDto))
		.executeTakeFirst()
		.then((result) => Number(result.insertId));

function insertableDtoToInsertionRow({
	id,
	name,
	displayName: display_name,
	homeUrl: home_url,
	description,
}: InsertablePlatformDto): Insertion {
	return {
		id,
		name,
		display_name,
		home_url,
		description,
	};
}
