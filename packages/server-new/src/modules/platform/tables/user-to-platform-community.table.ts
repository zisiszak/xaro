import { sql } from 'kysely';
import {
	type DatabaseTable,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface UserToPlatformCommunityTableSchema {
	userID: number;
	platformCommunityID: number;
}

export const UserToPlatformCommunityTable: DatabaseTable<'UserToPlatformCommunity'> = {
	name: 'UserToPlatformCommunity',
	compiledCreateTableQuery: compileTableSchemaQuery<UserToPlatformCommunityTableSchema>(
		'UserToPlatformCommunity',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(platformCommunityID, userID)`,
		},
		[
			'userID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('User'))
					.onUpdate('cascade')
					.onDelete('cascade'),
		],
		[
			'platformCommunityID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('PlatformCommunity'))
					.onDelete('restrict')
					.onUpdate('restrict'),
		],
	),
};
