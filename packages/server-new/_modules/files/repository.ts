import {
	sql,
	type Generated,
	type Insertable,
	type JSONColumnType,
	type Selectable,
	type Updateable,
} from 'kysely';
import { xaro } from '~/index.js';
import { FileFormatRepository } from '../file-format/index.js';
import {
	type FileDto,
	type FileMetadata,
	type FileOrigin,
	type InsertableFileDto,
} from './model.js';

export interface Table {
	id: Generated<number>;
	format_id: number;
	file_hash: string;
	data_hash: string | null;
	size: number;
	path: string | null;
	origin: JSONColumnType<FileOrigin>;
	metadata: JSONColumnType<FileMetadata>;
	date_added: Generated<number>;
}
type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
type Update = Updateable<Table>;

export const TABLE_NAME = 'FILES';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.addColumn('id', 'integer', (cb) => cb.notNull().unique().primaryKey())
	.addColumn('format_id', 'integer', (cb) =>
		cb
			.notNull()
			.references(`${FileFormatRepository.TABLE_NAME}.id`)
			.onDelete('restrict')
			.onUpdate('restrict'),
	)
	.addColumn('file_hash', 'text', (cb) => cb.notNull())
	.addColumn('data_hash', 'text', (cb) => cb.unique())
	.addColumn('size', 'integer', (cb) => cb.notNull())
	.addColumn('path', 'text', (cb) => cb.unique())
	.addColumn('origin', 'json', (cb) => cb.notNull())
	.addColumn('metadata', 'json', (cb) => cb.notNull().defaultTo('{}'))
	.addColumn('date_added', 'timestamp', (cb) =>
		cb
			.notNull()
			.defaultTo(sql`unixepoch('now')`)
			.modifyEnd(sql`,UNIQUE(file_hash, size)`),
	)
	.compile();

export const findAllByHash = (kind: 'data' | 'file', hash: string): Promise<FileDto[]> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where(kind === 'data' ? 'data_hash' : 'file_hash', '=', hash)
		.execute()
		.then((result) => result.map(selectionRowToDto) as FileDto[]);

export const findAllByUserIDLinkAndContentIDLink = (
	userID: number,
	contentID: number,
): Promise<FileDto[]> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.innerJoin('CONTENT_LINKED_FILES', 'CONTENT_LINKED_FILES.file_id', 'FILES.id')
		.innerJoin('USER_LINKED_FILES', 'USER_LINKED_FILES.file_id', 'FILES.id')
		.innerJoin(
			'USER_LINKED_CONTENT',
			'USER_LINKED_CONTENT.content_id',
			'CONTENT_LINKED_FILES.content_id',
		)
		.select([
			'CONTENT_LINKED_FILES.file_id as id',
			'USER_LINKED_CONTENT.content_id as content_id',
			'USER_LINKED_FILES.file_id as id',
		])
		.where((eb) =>
			eb.and([
				eb('CONTENT_LINKED_FILES.content_id', '=', contentID),
				eb('USER_LINKED_FILES.user_id', '=', userID),
			]),
		)
		.execute()
		.then((result) => result.map(selectionRowToDto) as FileDto[]);

export const insert = async (insertionDto: InsertableFileDto): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.executeTakeFirstOrThrow()
		.then((result) => Number(result.insertId));

export const findByID = async (id: number): Promise<FileDto | undefined> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then(selectionRowToDto);

export const removeByID = async (id: number): Promise<1 | 0> =>
	xaro.db
		.deleteFrom(TABLE_NAME)
		.where('id', '=', id)
		.executeTakeFirst()
		.then((result) => Number(result) as 1 | 0);

export const updatePathByID = async (id: number, path: string): Promise<void> =>
	xaro.db
		.updateTable(TABLE_NAME)
		.where('id', '=', id)
		.set({ path })
		.executeTakeFirstOrThrow()
		.then(() => {});

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): FileDto;
function selectionRowToDto(row?: Selection | undefined): FileDto | undefined;
function selectionRowToDto(row?: Selection | undefined): FileDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		id: row.id,
		dataHash: row.data_hash,
		fileHash: row.file_hash,
		formatID: row.format_id,
		metadata: row.metadata,
		origin: row.origin,
		path: row.path,
		size: row.size,
		dateAdded: new Date(row.date_added),
	};
}

function insertableDtoToInsertionRow({
	dataHash: data_hash,
	fileHash: file_hash,
	formatID: format_id,
	metadata = {},
	origin,
	path,
	size,
}: InsertableFileDto): Insertion {
	return {
		data_hash,
		file_hash,
		format_id,
		metadata: JSON.stringify(metadata),
		origin: JSON.stringify(origin),
		path,
		size,
	};
}
