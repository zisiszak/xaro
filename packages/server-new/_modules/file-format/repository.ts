import { sql, type Generated, type Insertable, type JSONColumnType, type Selectable } from 'kysely';
import { xaro } from '~/index.js';
import { defaultFileFormats } from './defaults.js';
import {
	FileFormatCategoryEnum,
	type FileExtension,
	type FileFormatCategory,
	type FileFormatDto,
	type InsertableFileFormatDto,
} from './model.js';

export { findAllByExtension, findByID } from './cache.js';

export interface Table {
	id: Generated<number>;
	name: string;
	short_name: string;
	description: string | null;
	category: FileFormatCategory;
	extensions: JSONColumnType<FileExtension[]>;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'FILE_FORMATS';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('id', 'integer', (cb) => cb.notNull().primaryKey().unique())
	.addColumn('name', 'text', (cb) => cb.notNull().unique())
	.addColumn('short_name', 'text', (cb) => cb.unique().notNull())
	.addColumn('description', 'text')
	.addColumn('category', 'integer', (cb) => cb.notNull())
	.addColumn('extensions', 'json', (cb) =>
		cb.notNull().modifyEnd(sql`,
        CHECK(
            category in (${Object.values(FileFormatCategoryEnum)})
        )
    `),
	)
	.compile();

export const setDefaults = () =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(
			Object.values(defaultFileFormats).map((format) => {
				const value = insertableDtoToInsertionRow(format);
				value.id = format.id;
				return value;
			}),
		)
		.onConflict((cb) =>
			cb.column('id').doUpdateSet((eb) => ({
				category: eb.ref('excluded.category'),
				description: eb.ref('excluded.description'),
				extensions: eb.ref('excluded.extensions'),
				name: eb.ref('excluded.name'),
				short_name: eb.ref('excluded.short_name'),
			})),
		)
		.execute();

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): FileFormatDto;
function selectionRowToDto(row?: Selection | undefined): FileFormatDto | undefined;
function selectionRowToDto(row?: Selection | undefined): FileFormatDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		id: row.id,
		category: row.category,
		description: row.description,
		name: row.name,
		shortName: row.short_name,
		extensions: new Set(row.extensions),
	};
}

function insertableDtoToInsertionRow({
	name,
	description,
	shortName: short_name,
	category,
	extensions,
}: InsertableFileFormatDto): Insertion {
	return {
		name,
		description,
		short_name,
		category,
		extensions: JSON.stringify(Array.from(extensions)),
	};
}
