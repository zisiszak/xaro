import { is } from 'is-guard';
import { sql, type Generated, type Insertable, type Selectable } from 'kysely';
import { xaro } from '~/index.js';
import { type DateAddedColumn } from '~/utils/types.js';
import { userRoles, type InsertableUserDto, type UserDto, type UserRole } from './model.js';
import { convertHashToUserAuthentication } from './user-authentication.js';

export interface Table {
	id: Generated<number>;
	username: string;
	role: UserRole;
	password_hash: string | null;
	password_salt: string | null;
	date_added: DateAddedColumn;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const TABLE_NAME = 'USERS';

export const createTableQuery = xaro.db.schema
	.createTable(TABLE_NAME)
	.ifNotExists()
	.addColumn('id', 'integer', (cb) => cb.primaryKey().notNull().unique())
	.addColumn('username', 'text', (cb) => cb.notNull().unique())
	.addColumn('role', 'text', (cb) => cb.notNull())
	.addColumn('password_hash', 'text')
	.addColumn('password_salt', 'text')
	.addColumn('date_added', 'timestamp', (cb) =>
		cb.notNull().defaultTo(sql`unixexpoch('now')`).modifyEnd(sql`,
	CHECK(
		role in (${userRoles})
	),
	CHECK(
		(
			password_hash IS NULL AND
			password_salt IS NULL
		)
			OR
		(
			password_hash IS NOT NULL AND
			password_salt IS NOT NULL
		)
	)`),
	)
	.compile();

export const findByID = async (id: number) =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then(selectionRowToDto);

export const findByUsername = async (name: string) =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('username', '=', name)
		.executeTakeFirst()
		.then(selectionRowToDto);

export const isUsernameAvailable = async (username: string): Promise<boolean> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.select('id')
		.where('username', '=', username)
		.executeTakeFirst()
		.then(is.undefined);

export const insert = async (insertionDto: InsertableUserDto): Promise<number> =>
	xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.executeTakeFirstOrThrow()
		.then((result) => Number(result.insertId));

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): UserDto;
function selectionRowToDto(row?: Selection | undefined): UserDto | undefined;
function selectionRowToDto(row?: Selection | undefined): UserDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		id: row.id,
		username: row.username,
		role: row.role,
		authentication: convertHashToUserAuthentication(row.password_hash, row.password_salt),
		dateAdded: new Date(row.date_added),
	};
}

function insertableDtoToInsertionRow({
	username,
	authentication,
	role,
}: InsertableUserDto): Insertion {
	return {
		username,
		password_hash: authentication?.hash,
		password_salt: authentication?.salt,
		role,
	};
}
