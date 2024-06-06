import {
	type ColumnType,
	type Generated,
	type Insertable,
	type JSONColumnType,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type Database } from '../database.js';

export type OriginalMediaUploadParams = {
	kind: 'media';
	generateDefaultThumbnails?: boolean;
	createOptimisedMedia?: boolean;
	customTitle?: string;
	customDescription?: string;
};
export interface ThumbnailUploadParams {
	kind: 'thumbnail';
	forContentId: number;
	label?: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type MediaUploadParams =
	| OriginalMediaUploadParams
	| ThumbnailUploadParams;

export type Status =
	| 'PENDING'
	| 'COMPLETE'
	| 'UPLOAD_FAILED'
	| 'HASHES_DO_NOT_MATCH';

export interface Model {
	id: Generated<number>;

	linkedUserId: number;

	/** SHA-1 */
	clientFileHash: string;

	/** The destination path the file will be uploaded to on the server, if valid. */
	destinationFilePath: string;

	originalFileName: string;

	params: JSONColumnType<MediaUploadParams>;

	/** */
	status: ColumnType<Status, Status | null, Status>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createMediaUploadTable = (db: Database) =>
	db.schema
		.createTable('ContentUpload')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('linkedUserId', 'integer', (cb) =>
			cb
				.notNull()
				.references('User.id')
				.onUpdate('cascade')
				.onDelete('cascade'),
		)
		.addColumn('clientFileHash', 'text', (cb) => cb.notNull().unique())
		.addColumn('destinationFilePath', 'text', (cb) => cb.notNull().unique())
		.addColumn('originalFileName', 'text', (cb) => cb.notNull())
		.addColumn('status', 'text', (cb) => cb.defaultTo('PENDING'))
		.addColumn('params', 'json', (cb) => cb.notNull())
		.execute();
