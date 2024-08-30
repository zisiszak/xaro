import { sql, type JSONColumnType } from 'kysely';
import {
	compileTableSchemaQuery,
	referenceForeignTableID,
	type DatabaseTable,
	type TableProtocol,
} from '~/shared/index.js';
import { type PlatformCommunityMetadata } from '../models/platform.model.js';

export interface PlatformCommunityTableSchema
	extends TableProtocol.AutoDateAdded,
		TableProtocol.Identifiable {
	platformID: number;
	name: string;
	sourceId: string;
	sourceUrl: string;
	displayName: string;
	description: string | null;
	metadata: JSONColumnType<PlatformCommunityMetadata, string | undefined>;
}

export const PlatformCommunityTable: DatabaseTable<'PlatformCommunity'> = {
	name: 'PlatformCommunity',
	compiledCreateTableQuery: compileTableSchemaQuery<PlatformCommunityTableSchema>(
		'PlatformCommunity',
		['AutoDateAdded', 'Identifiable'],
		{
			modifyLastColumnEnd: sql`,UNIQUE(platformID, sourceId)`,
		},
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
		['sourceId', 'text', (cb) => cb.notNull()],
		['sourceUrl', 'text', (cb) => cb.notNull().unique()],
		['displayName', 'text', (cb) => cb.notNull()],
		['description', 'text'],
		['metadata', 'json', (cb) => cb.notNull()],
	),
};
