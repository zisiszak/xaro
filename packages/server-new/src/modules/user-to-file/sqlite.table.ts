import { sql } from 'kysely';
import {
	type DatabaseTable,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface UserToFileTableSchema {
	userID: number;
	originalFileID: number;
}

export const UserToFileTable: DatabaseTable<'UserToFile'> = {
	name: 'UserToFile',
	compiledCreateTableQuery: compileTableSchemaQuery<UserToFileTableSchema>(
		'UserToFile',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(originalFileID, userID)`,
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
			'originalFileID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('File'))
					.onUpdate('cascade')
					.onDelete('cascade'),
		],
	),
};
