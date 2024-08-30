import { type Generated, type Insertable, type JSONColumnType, type Selectable } from 'kysely';
import { xaro } from '~/index.js';
import { type CreatorAliases } from './aliases.js';
import { type CreatorDto, type InsertableCreatorDto } from './model.js';

export interface Table {
	id: Generated<number>;
	name: string;
	display_name: string;
	aliases: JSONColumnType<CreatorAliases, string | undefined>;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'CREATORS';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
	.addColumn('name', 'text', (cb) => cb.notNull().unique())
	.addColumn('display_name', 'text', (cb) => cb.notNull())
	.addColumn('aliases', 'json', (cb) => cb.defaultTo('[]').notNull())
	.compile();

function insertableDtoToInsertionRow({
	name,
	displayName: display_name,
	aliases = [],
}: InsertableCreatorDto): Insertion {
	return {
		name,
		display_name,
		aliases: JSON.stringify(aliases),
	};
}

export const findByID = async (id: number) =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then(selectionRowToDto);

export const insert = async (insertionDto: InsertableCreatorDto): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.executeTakeFirstOrThrow()
		.then((result) => Number(result.insertId));

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): CreatorDto;
function selectionRowToDto(row?: Selection | undefined): CreatorDto | undefined;
function selectionRowToDto(row?: Selection | undefined): CreatorDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		id: row.id,
		name: row.name,
		displayName: row.display_name,
		aliases: row.aliases,
	};
}
