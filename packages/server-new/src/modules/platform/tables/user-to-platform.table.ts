import { sql } from 'kysely';
import {
	type DatabaseTable,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface UserToPlatformTableSchema {
	userID: number;
	platformID: number;
}

export const UserToPlatformTable: DatabaseTable<'UserToPlatform'> = {
	name: 'UserToPlatform',
	compiledCreateTableQuery: compileTableSchemaQuery<UserToPlatformTableSchema>(
		'UserToPlatform',
		null,
		{ modifyLastColumnEnd: sql`, UNIQUE(platformID, userID)` },
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
			'platformID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('Platform'))
					.onDelete('restrict')
					.onUpdate('restrict')
					.modifyEnd(sql`, UNIQUE(platformID, userID)`),
		],
	),
};
