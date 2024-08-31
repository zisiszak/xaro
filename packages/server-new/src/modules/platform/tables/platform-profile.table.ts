import { sql, type JSONColumnType } from 'kysely';
import {
	compileTableSchemaQuery,
	referenceForeignTableID,
	type DatabaseTable,
	type TableProtocol,
} from '~/shared/index.js';
import { type PlatformProfileMetadata } from '../models/platform.model.js';

export interface PlatformProfileTableSchema
	extends TableProtocol.AutoDateAdded,
		TableProtocol.Identifiable {
	platformID: number;
	creatorID: number;
	displayName: string;
	name: string;
	sourceId: string;
	sourceUrl: string | null;
	description: string | null;
	metadata: JSONColumnType<PlatformProfileMetadata, string | undefined>;
}

export const PlatformProfileTable: DatabaseTable<'PlatformProfile'> = {
	name: 'PlatformProfile',
	compiledCreateTableQuery: compileTableSchemaQuery<PlatformProfileTableSchema>(
		'PlatformProfile',
		['AutoDateAdded', 'Identifiable'],
		{ modifyLastColumnEnd: sql`,UNIQUE(platformID, sourceID)` },
		[
			'platformID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('Platform'))
					.onDelete('restrict')
					.onUpdate('cascade'),
		],
		[
			'creatorID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('Creator'))
					.onDelete('restrict')
					.onUpdate('cascade'),
		],
		['sourceId', 'text', (cb) => cb.notNull()],
		['sourceUrl', 'text', (cb) => cb.unique()],
		['displayName', 'text', (cb) => cb.notNull()],
		['description', 'text'],
	),
};
