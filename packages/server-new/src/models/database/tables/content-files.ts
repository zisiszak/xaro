import { type GenericError, newError } from 'exitus';
import {
	type Insertable,
	type JSONColumnType,
	type Kysely,
	type Selectable,
	sql,
	type Updateable,
} from 'kysely';
import { xaro } from '~/index.js';
import { createInsertionValueParser } from '~/utils/kysely.js';
import { Content, Files } from './index.js';

export const name = 'CONTENT_FILES';

export type ContentFileRelationshipTag =
	(typeof ContentFileRelationshipTagEnum)[keyof typeof ContentFileRelationshipTagEnum];
const ContentFileRelationshipTagEnum = {
	Content: 1,
	Thumbnail: 10,
	Preview: 11,
	Subtitles: 20,
	Metadata: 30,
	Dump: 99,
} as const;

export interface ContentFileMetadata {
	/** seconds */
	thumbnail_timestamp?: number;
	/** seconds */
	preview_in_timestamp?: number;
	/** seconds */
	preview_out_timestamp?: number;
}

export interface __TableSchema {
	file_id: number;
	content_id: number;
	/** File relationship to content */
	rel_tag: ContentFileRelationshipTag;
	metadata: JSONColumnType<ContentFileMetadata>;
}

export type Selection = Selectable<__TableSchema>;
export type Update = Updateable<__TableSchema>;
export type Insertion = Insertable<__TableSchema>;

export async function init(db: Kysely<unknown>) {
	return db.schema
		.createTable(name)
		.ifNotExists()
		.addColumn('file_id', 'integer', (cb) =>
			cb.notNull().references(`${Files.name}.id`).onUpdate('cascade').onDelete('cascade'),
		)
		.addColumn('content_id', 'integer', (cb) =>
			cb.notNull().references(`${Content.name}.id`).onUpdate('cascade').onDelete('cascade'),
		)
		.addColumn('rel_tag', 'integer', (cb) => cb.notNull())
		.addColumn('metadata', 'json', (cb) =>
			cb.notNull().modifyEnd(sql`,
				UNIQUE(
					file_id, content_id
				),
				CHECK(
					rel_tag in (${Object.values(ContentFileRelationshipTagEnum)})
				)`),
		)
		.execute();
}

interface RawContentLinkedFileEntryInsertion {
	file_id: number;
	content_id: number;
	rel_tag: ContentFileRelationshipTag;
	metadata?: ContentFileMetadata;
}

const parseInsertionValue = createInsertionValueParser<
	Insertion,
	RawContentLinkedFileEntryInsertion
>({
	parser: (raw: RawContentLinkedFileEntryInsertion) => ({
		...raw,
		metadata: JSON.stringify(raw.metadata ?? {}),
	}),
});

export async function insert(
	entry: RawContentLinkedFileEntryInsertion | RawContentLinkedFileEntryInsertion[],
): Promise<void | GenericError> {
	return xaro.db
		.insertInto(name)
		.values(parseInsertionValue(entry))
		.executeTakeFirstOrThrow()
		.then(() => {})
		.catch((err) => newError({ caughtException: err }));
}
