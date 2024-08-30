import { type Insertable, type Selectable, sql } from 'kysely';
import { ContentRepository } from '~/_modules/content/index.js';
import { xaro } from '~/index.js';
import { FileRepository } from '../index.js';
import {
	type ContentLinkedFileRelationship,
	ContentLinkedFileRelationshipEnum,
	type InsertableContentLinkedFileDto,
} from './model.js';

export interface Table {
	file_id: number;
	content_id: number;
	relationship: ContentLinkedFileRelationship;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;

export const TABLE_NAME = 'CONTENT_LINKED_FILES';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.addColumn('file_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${FileRepository.TABLE_NAME}.id`)
			.onDelete('cascade')
			.onUpdate('cascade'),
	)
	.addColumn('content_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${ContentRepository.TABLE_NAME}.id`)
			.onUpdate('cascade')
			.onDelete('cascade'),
	)
	.addColumn('relationship', 'integer', (cb) =>
		cb.notNull().modifyEnd(sql`,CHECK(
        relationship in (${Object.values(ContentLinkedFileRelationshipEnum)})
    ),
		UNIQUE(file_id, content_id)
	`),
	)
	.compile();

export const insert = async (insertableDto: InsertableContentLinkedFileDto): Promise<void> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertableDto))
		.onConflict((cb) => cb.doNothing())
		.executeTakeFirst()
		.then(() => {});

// function selectionRowToDto(row?: undefined): undefined;
// function selectionRowToDto(row: Selection): ContentLinkedFileDto;
// function selectionRowToDto(row?: Selection | undefined): ContentLinkedFileDto | undefined;
// function selectionRowToDto(row?: Selection | undefined): ContentLinkedFileDto | undefined {
// 	if (typeof row === 'undefined') return undefined;
// 	return {
// 		fileID: row.file_id,
// 		contentID: row.content_id,
// 		relationship: row.relationship,
// 	};
// }

function insertableDtoToInsertionRow({
	fileID: file_id,
	contentID: content_id,
	relationship,
}: InsertableContentLinkedFileDto): Insertion {
	return { file_id, content_id, relationship };
}
