import { sql } from 'kysely';
import {
	type DatabaseTable,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface UserToMediaTableSchema {
	userID: number;
	mediaID: number;
}

export const UserToMediaTable: DatabaseTable<'UserToMedia'> = {
	name: 'UserToMedia',
	compiledCreateTableQuery: compileTableSchemaQuery<UserToMediaTableSchema>(
		'UserToMedia',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(userID, mediaID)`,
		},
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
	),
};
