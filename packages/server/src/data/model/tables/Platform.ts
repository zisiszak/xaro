import {
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type PluginModuleReference } from '~/exports.js';
import { type DatabaseSchema } from '../database.js';

export interface Model {
	id: Generated<number>;
	name: string;

	displayName: string;
	description: string | null;
	homeUrl: string;

	platformManager: PluginModuleReference | null;
	genericPlatformsManager: PluginModuleReference | null;
	mediaExtractor: PluginModuleReference | null;
	metadataExtractor: PluginModuleReference | null;

	urlRegExp: string;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createPlatformTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('Platform')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('displayName', 'text', (cb) => cb.notNull())
		.addColumn('description', 'text')
		.addColumn('urlRegExp', 'text', (cb) => cb.notNull().unique())
		.addColumn('homeUrl', 'text', (cb) => cb.notNull().unique())
		.addColumn('platformManager', 'text')
		.addColumn('genericPlatformsManager', 'text')
		.addColumn('mediaExtractor', 'text')
		.addColumn('metadataExtractor', 'text')
		.addColumn('name', 'text', (cb) => cb.notNull().unique())
		.execute();
