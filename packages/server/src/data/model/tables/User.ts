import {
	sql,
	type ColumnType,
	type Generated,
	type Insertable,
	type Kysely,
	type Selectable,
	type Updateable,
} from 'kysely';
import { type DatabaseSchema } from '../database.js';

export const userRoles = ['admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];
export const isUserRole = (v: unknown): v is UserRole =>
	userRoles.includes(v as UserRole);

export interface Model {
	id: Generated<number>;
	username: string;
	role: UserRole;
	passwordHash: string | null;
	passwordSalt: string | null;
	dateAdded: ColumnType<Date, string | undefined, never>;
}

export type Selection = Selectable<Model>;
export type Insertion = Insertable<Model>;
export type Update = Updateable<Model>;

export const createUserTable = (db: Kysely<DatabaseSchema>) =>
	db.schema
		.createTable('User')
		.ifNotExists()
		.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
		.addColumn('username', 'text', (cb) => cb.notNull().unique())
		.addColumn('role', 'text', (cb) => cb.notNull())
		.addColumn('passwordHash', 'text')
		.addColumn('passwordSalt', 'text')
		.addColumn('dateAdded', 'timestamp', (cb) =>
			cb.notNull().defaultTo(sql`current_timestamp`),
		)
		.execute();
