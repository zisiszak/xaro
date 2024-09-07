import { sql } from 'kysely';
import { type DatabaseTable, type TableProtocol, compileTableSchemaQuery } from '~/shared/index.js';
import { type UserRole } from '../model/user-role.js';

export interface UserTableSchema extends TableProtocol.Identifiable, TableProtocol.AutoDateAdded {
	username: string;
	role: UserRole;
	passwordHash: string | null;
	passwordSalt: string | null;
}

export const UserTable: DatabaseTable<'User'> = {
	name: 'User',
	compiledCreateTableQuery: compileTableSchemaQuery<UserTableSchema>(
		'User',
		['Identifiable', 'AutoDateAdded'],
		{
			modifyLastColumnEnd: sql`, CHECK(
		role in (1, 2)
	),
	CHECK(
		(
			passwordHash IS NULL AND
			passwordSalt IS NULL
		)
			OR
		(
			passwordHash IS NOT NULL AND
			passwordSalt IS NOT NULL
		)
	)`,
		},
		['username', 'text', (cb) => cb.notNull().unique()],
		['role', 'integer', (cb) => cb.notNull()],
		['passwordHash', 'text'],
		['passwordSalt', 'text'],
	),
};
