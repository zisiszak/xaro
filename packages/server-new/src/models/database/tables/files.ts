import { isError, newError } from 'exitus';
import { is } from 'is-guard';
import {
	sql,
	type ColumnType,
	type Generated,
	type Insertable,
	type JSONColumnType,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { xaro } from '~/index.js';
import { createInsertionValueParser } from '~/utils/kysely.js';
import { type DateAddedColumn } from '~/utils/types.js';
import { FileFormats, Users } from './index.js';

export const name = 'FILES';

export type FileSourceTag = (typeof FileSourceTagEnum)[keyof typeof FileSourceTagEnum];
export const FileSourceTagEnum = {
	/** Directly uploaded by a user. */
	UploadedByUser: 1,
	/** Downloaded using an extractor. */
	DownloadedViaExtractor: 2,
	/** Generated from a file with rel `Content` */
	GeneratedFromOtherFile: 10,
	/** For embedded files that have been extracted from an existing file (e.g. thumbnails from a video) */
	EmbeddedInOtherFile: 11,
} as const;

export interface FileMetadata {
	/** pixels */
	width?: number;
	/** pixels */
	height?: number;
	/** bits per second */
	bitrate?: number;
	/** frames per second */
	framerate?: number;
	/** seconds */
	duration?: number;
	quality?: number;
	lossless?: boolean;
	compressed?: boolean;
	original_filename?: string;
}

export interface __TableSchema {
	id: Generated<number>;
	owner_id: number;
	format_id: number;
	full_hash: string;
	data_hash: string | null;
	/** bytes */
	size: number;
	/** File path relative to library data directory. */
	path: string;
	/** File extension */
	source_tag: FileSourceTag;
	source_url: string | null;
	/** if generated or extracted after being embedded in another file. */
	source_file_hash: string | null;
	metadata: JSONColumnType<FileMetadata>;
	date_added: DateAddedColumn;
	marked_for_removal: ColumnType<int_bool, undefined, int_true>;
}

export type Selection = Selectable<__TableSchema>;
export type Update = Updateable<__TableSchema>;
export type Insertion = Insertable<__TableSchema>;

export async function init(db: Kysely<unknown>) {
	return db.schema
		.createTable(name)
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('full_hash', 'text', (cb) => cb.notNull())
		.addColumn('data_hash', 'text', (cb) => cb.unique())
		.addColumn('size', 'integer', (cb) => cb.notNull())
		.addColumn('path', 'text', (cb) => cb.notNull())
		.addColumn('format_id', 'integer', (cb) =>
			cb
				.references(`${FileFormats.name}.id`)
				.notNull()
				.onDelete('restrict')
				.onUpdate('cascade'),
		)
		.addColumn('source_tag', 'integer')
		.addColumn('source_url', 'text')
		.addColumn('source_file_hash', 'text')
		.addColumn('metadata', 'json', (cb) => cb.notNull())
		.addColumn('owner_id', 'integer', (cb) =>
			cb.notNull().references(`${Users.name}.id`).onDelete('cascade').onUpdate('cascade'),
		)
		.addColumn('date_added', 'integer', (cb) => cb.notNull().defaultTo(sql`unixepoch('now')`))
		.addColumn('marked_for_removal', 'boolean', (cb) =>
			cb.defaultTo(0).notNull().modifyEnd(sql`,
			UNIQUE(full_hash, owner_id, size)
			`),
		)
		.execute();
}

interface RawFileEntryInsertion {
	id?: number;
	full_hash: string;
	data_hash?: string;
	size: number;
	path: string;
	format_id: number;
	source_tag: FileSourceTag;
	source_url?: string;
	source_file_hash?: string;
	metadata: FileMetadata;
	owner_id: number;
}
const parseInsertionValue = createInsertionValueParser<Insertion, RawFileEntryInsertion>({
	parser: (raw) => ({
		...raw,
		metadata: JSON.stringify(raw.metadata),
	}),
});

/** Returns a promise which fulfills with the new file ID */
export async function insert(
	entry: RawFileEntryInsertion | RawFileEntryInsertion[],
): Promise<ErrorResultTuple<number>> {
	return xaro.db
		.insertInto(name)
		.values(parseInsertionValue(entry))
		.executeTakeFirstOrThrow()
		.then((result) => [undefined, Number(result.insertId)] as const)
		.catch((err) => [newError({ caughtException: err })]);
}

export async function removeEntryByID(id: number): Promise<ErrorResultTuple<number>>;
export async function removeEntryByID(ids: number[]): Promise<ErrorResultTuple<number>>;
export async function removeEntryByID(
	idOrIds: number[] | number,
): Promise<ErrorResultTuple<number>> {
	let q = xaro.db.deleteFrom(name);
	if (typeof idOrIds === 'number') {
		q = q.where('id', '=', idOrIds);
	} else if (Array.isArray(idOrIds) && idOrIds.every(is.number)) {
		q = q.where('id', 'in', idOrIds);
	}

	return q
		.execute()
		.then(
			(res) =>
				[
					undefined,
					res.reduce<number>((prev, curr) => prev + Number(curr.numDeletedRows), 0),
				] as const,
		)
		.catch((err) => [newError({ caughtException: err })]);
}

type IsFileHashInDbProps = {
	fullHash?: string;
	dataHash?: string;
	ownerID: number;
} & (
	| {
			fullHash: string;
	  }
	| {
			dataHash: string;
	  }
);
export async function checkIsHashInTable({
	fullHash,
	dataHash,
	ownerID,
}: IsFileHashInDbProps): Promise<
	ErrorResultTuple<
		| {
				existing: false;
		  }
		| {
				existing: {
					id: number;
					path: string;
					full_hash: string;
					data_hash: string | null;
					owner_id: number;
				};
				userOwnsExisting: boolean;
		  }
	>
> {
	let query = xaro.db
		.selectFrom(name)
		.select(['id', 'data_hash', 'full_hash', 'size', 'owner_id', 'path']);

	if (typeof dataHash === 'string') query = query.where('data_hash', '=', dataHash);
	else if (typeof fullHash === 'string') query = query.where('full_hash', '=', fullHash);

	const entries = await query.execute().catch((err) => newError({ caughtException: err }));
	if (isError(entries)) {
		return [entries];
	}

	if (entries.length === 0) {
		return [undefined, { existing: false }];
	}

	const entryOfSameOwner = entries.find((entry) => ownerID === entry.owner_id);

	return [
		undefined,
		{
			existing: entryOfSameOwner ? entryOfSameOwner : entries[0]!,
			userOwnsExisting: !!entryOfSameOwner,
		},
	];
}

export async function readEntryWhereID(
	where:
		| {
				relativeFilePath: string;
				ownerID: number;
		  }
		| { fileID: number }
		| { ownerID: number; fullHash?: string; dataHash: string }
		| { ownerID: number; fullHash: string; dataHash?: string },
): Promise<Selection | undefined> {
	let q = xaro.db.selectFrom(name).selectAll();
	if ('fileID' in where) {
		q = q.where('id', '=', where.fileID);
	} else if ('relativeFilePath' in where) {
		q = q.where((eb) =>
			eb.and([eb('path', '=', where.relativeFilePath), eb('owner_id', '=', where.ownerID)]),
		);
	} else if ('fullHash' in where && typeof where.fullHash === 'string') {
		q = q.where((eb) =>
			eb.and([eb('full_hash', '=', where.fullHash!), eb('owner_id', '=', where.ownerID)]),
		);
	} else {
		q = q.where((eb) =>
			eb.and([eb('data_hash', '=', where.dataHash!), eb('owner_id', '=', where.ownerID)]),
		);
	}

	return q.executeTakeFirst();
}
