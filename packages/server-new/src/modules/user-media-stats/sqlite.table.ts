import { sql, type ColumnType } from 'kysely';
import {
	compileTableSchemaQuery,
	referenceForeignTableID,
	type DatabaseTable,
} from '~/shared/index.js';

export interface UserMediaStatsTableSchema {
	userID: number;
	mediaID: number;
	seen: ColumnType<IntBool, IntBool | undefined>;
	playCount: ColumnType<number, number | undefined>;
	lastPlayhead: number | null;
	dateLastPlayed: number | null;
	isFavourite: ColumnType<IntBool, IntBool | undefined>;
	rating: number | null;
}

export const UserMediaStatsTable: DatabaseTable<'UserMediaStats'> = {
	name: 'UserMediaStats',
	compiledCreateTableQuery: compileTableSchemaQuery<UserMediaStatsTableSchema>(
		'UserMediaStats',
		null,
		{ modifyLastColumnEnd: sql`,UNIQUE(userID, mediaID)` },
		[
			'userID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('User'))
					.onDelete('cascade')
					.onUpdate('cascade'),
		],
		[
			'mediaID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('Media'))
					.onDelete('cascade')
					.onUpdate('cascade'),
		],
		['seen', 'boolean', (cb) => cb.notNull().defaultTo(0)],
		['playCount', 'integer', (cb) => cb.defaultTo(null)],
		['lastPlayhead', 'integer', (cb) => cb.defaultTo(null)],
		['dateLastPlayed', 'integer', (cb) => cb.defaultTo(null)],
		['isFavourite', 'boolean', (cb) => cb.defaultTo(0).notNull()],
		['rating', 'integer', (cb) => cb.defaultTo(null)],
	),
};
