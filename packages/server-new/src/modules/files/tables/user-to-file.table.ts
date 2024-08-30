import { sql } from 'kysely';
import {
	type DatabaseTable,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface UserToFileTableSchema {
	userID: number;
	fileID: number;
}

export const UserToFileTable: DatabaseTable<'UserToFile'> = {
	name: 'UserToFile',
	compiledCreateTableQuery: compileTableSchemaQuery<UserToFileTableSchema>(
		'UserToFile',
		null,
		{
			modifyLastColumnEnd: sql`,UNIQUE(fileID, userID)`,
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
			'fileID',
			'integer',
			(cb) =>
				cb
					.notNull()
					.references(referenceForeignTableID('File'))
					.onUpdate('cascade')
					.onDelete('cascade')
					.modifyEnd(sql`,UNIQUE(fileID, userID)`),
		],
	),
};
