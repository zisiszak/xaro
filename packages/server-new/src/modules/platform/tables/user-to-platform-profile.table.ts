import { sql } from 'kysely';
import {
	type DatabaseTable,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface UserToPlatformProfileTableSchema {
	userID: number;
	platformProfileID: number;
}

export const UserToPlatformProfileTable: DatabaseTable<'UserToPlatformProfile'> = {
	name: 'UserToPlatformProfile',
	compiledCreateTableQuery: compileTableSchemaQuery<UserToPlatformProfileTableSchema>(
		'UserToPlatformProfile',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(platformProfileID, userID)`,
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
			'platformProfileID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('PlatformProfile'))
					.onDelete('restrict')
					.onUpdate('restrict')
					.modifyEnd(sql`, UNIQUE(platformProfileID, userID)`),
		],
	),
};
