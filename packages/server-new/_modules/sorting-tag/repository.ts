import { type Generated, type Insertable, type Selectable } from 'kysely';
import { xaro } from '~/index.js';
import { type InsertableSortingTagDto, type SortingTagDto } from './model.js';

export interface Table {
	id: Generated<number>;
	name: string;
	description: string | null;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'SORTING_TAGS';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.addColumn('id', 'integer', (cb) => cb.notNull().unique().primaryKey())
	.addColumn('name', 'text', (cb) => cb.notNull().unique())
	.addColumn('description', 'text')
	.compile();

export const findByID = async (id: number) =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then(selectionRowToDto);

export const getIDFromName = async (name: string): Promise<number> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.select('id')
		.where('name', '=', name)
		.executeTakeFirstOrThrow()
		.then(({ id }) => id);

export const insert = async (insertionDto: InsertableSortingTagDto): Promise<number | undefined> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.onConflict((cb) => cb.doNothing())
		.executeTakeFirst()
		.then((result) => (typeof result === 'undefined' ? undefined : Number(result)));

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): SortingTagDto;
function selectionRowToDto(row?: Selection | undefined): SortingTagDto | undefined;
function selectionRowToDto(row?: Selection | undefined): SortingTagDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		id: row.id,
		name: row.name,
		description: row.description,
	};
}

function insertableDtoToInsertionRow({ name, description }: InsertableSortingTagDto): Insertion {
	return {
		name,
		description,
	};
}
