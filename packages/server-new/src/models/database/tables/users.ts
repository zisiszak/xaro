import { newError } from 'exitus';
import {
	sql,
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { xaro } from '~/index.js';
import { hashPassword } from '~/utils/index.js';
import { type DateAddedColumn } from '~/utils/types.js';

export const name = 'USERS';

export const UserRoleEnum = {
	standard: 0,
	admin: 1,
} as const;
export type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];
export function isUserRole(value: unknown): value is UserRole {
	return value === 0 || value === 1;
}

export interface __TableSchema {
	id: Generated<number>;
	username: string;
	role: UserRole;
	password_hash: string | null;
	password_salt: string | null;
	date_added: DateAddedColumn;
}

export type Selection = Selectable<__TableSchema>;
export type Update = Updateable<__TableSchema>;
export type Insertion = Insertable<__TableSchema>;

export async function init(db: Kysely<unknown>) {
	return db.schema
		.createTable(name)
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('username', 'text', (cb) => cb.notNull().unique())
		.addColumn('role', 'text', (cb) => cb.notNull())
		.addColumn('password_hash', 'text')
		.addColumn('password_salt', 'text')
		.addColumn('date_added', 'timestamp', (cb) =>
			cb.notNull().defaultTo(sql`unixexpoch('now')`),
		)
		.execute();
}

export async function checkIfUsernameTaken(username: string): Promise<boolean> {
	return xaro.db
		.selectFrom(name)
		.select('id')
		.where('username', '=', username)
		.executeTakeFirst()
		.then(Boolean);
}

export async function insert({
	username,
	role,
	password,
}: {
	username: string;
	role: UserRole;
	password?: string;
}): Promise<ErrorResultTuple<number>> {
	const auth = password ? hashPassword(password) : null;
	return xaro.db
		.insertInto(name)
		.values({
			username,
			role,
			password_hash: auth?.hash,
			password_salt: auth?.salt,
		})
		.executeTakeFirstOrThrow()
		.then((result) => [undefined, Number(result.insertId!)] satisfies [undefined, number])
		.catch((err) => [
			newError({
				caughtException: err,
				log: 'error',
				message: 'Failed to add new User entry to database.',
			}),
		]);
}

export async function readEntryWhereID(id: number): Promise<undefined | Selection> {
	return xaro.db.selectFrom(name).selectAll().where('id', '=', id).executeTakeFirst();
}

export async function readEntryCredentialsWhereUsername(
	username: string,
): Promise<
	undefined | Pick<Selection, 'password_hash' | 'password_salt' | 'username' | 'role' | 'id'>
> {
	return xaro.db
		.selectFrom(name)
		.select(['password_hash', 'password_salt', 'id', 'role', 'username'])
		.where('username', '=', username)
		.executeTakeFirst();
}
