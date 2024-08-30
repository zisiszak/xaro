import { type Insertable, type Selectable, sql } from 'kysely';
import { SortingTagRepository } from '~/_modules/sorting-tag/index.js';
import { xaro } from '~/index.js';
import { ContentRepository } from '../index.js';
import {
	type InsertableSortingTagLinkedContentDto,
	type SortingTagLinkedContentDto,
} from './model.js';

export interface Table {
	content_id: number;
	sorting_tag_id: number;
}
type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;

export const TABLE_NAME = 'SORTING_TAG_LINKED_CONTENT';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.addColumn('content_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${ContentRepository.TABLE_NAME}.id`)
			.onDelete('cascade')
			.onUpdate('cascade'),
	)
	.addColumn('sorting_tag_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${SortingTagRepository.TABLE_NAME}.id`)
			.onDelete('cascade')
			.onUpdate('cascade')
			.modifyEnd(sql`,UNIQUE(content_id, sorting_tag_id)`),
	)
	.compile();

export const insert = async (
	insertionDto: InsertableSortingTagLinkedContentDto,
): Promise<number | undefined> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.onConflict((cb) => cb.doNothing())
		.executeTakeFirst()
		.then((result) => (typeof result === 'undefined' ? undefined : Number(result)));

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): SortingTagLinkedContentDto;
function selectionRowToDto(row?: Selection | undefined): SortingTagLinkedContentDto | undefined;
function selectionRowToDto(row?: Selection | undefined): SortingTagLinkedContentDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		sortingTagID: row.sorting_tag_id,
		contentID: row.content_id,
	};
}

function insertableDtoToInsertionRow({
	sortingTagID: sorting_tag_id,
	contentID: content_id,
}: InsertableSortingTagLinkedContentDto): Insertion {
	return {
		content_id,
		sorting_tag_id,
	};
}
