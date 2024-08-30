import { sql, type JSONColumnType } from 'kysely';
import {
	compileTableSchemaQuery,
	referenceForeignTableID,
	type DatabaseTable,
	type TableProtocol,
} from '~/shared/index.js';
import { type PlatformContentMetadata } from '../models/platform.model.js';

export interface PlatformMediaSourceTableSchema extends TableProtocol.Identifiable {
	platformID: number;
	platformCommunityID: number | null;
	platformProfileID: number | null;
	metadata: JSONColumnType<PlatformContentMetadata, string | undefined>;
	sourceId: string;
	sourceUrl: string | null;
}

export const PlatformMediaSourceTable: DatabaseTable<'PlatformMediaSource'> = {
	name: 'PlatformMediaSource',
	compiledCreateTableQuery: compileTableSchemaQuery<PlatformMediaSourceTableSchema>(
		'PlatformMediaSource',
		['Identifiable'],
		{ modifyLastColumnEnd: sql`,UNIQUE(sourceID, platformID)` },
		[
			'platformID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('Platform'))
					.onDelete('cascade')
					.onUpdate('cascade'),
		],
		[
			'platformCommunityID',
			'integer',
			(cb) =>
				cb
					.references(referenceForeignTableID('PlatformCommunity'))
					.onDelete('set null')
					.onUpdate('cascade'),
		],
		[
			'platformProfileID',
			'integer',
			(cb) =>
				cb
					.references(referenceForeignTableID('PlatformProfile'))
					.onDelete('set null')
					.onUpdate('cascade'),
		],
		['metadata', 'json', (cb) => cb.defaultTo('{}').notNull()],
		['sourceId', 'text', (cb) => cb.notNull()],
		['sourceUrl', 'text'],
	),
};
