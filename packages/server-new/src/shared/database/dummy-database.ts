import SQLite, { type Database } from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

const dummyDatabase: Database = new SQLite(':memory:');
const dummyKysely = new Kysely({
	dialect: new SqliteDialect({
		database: dummyDatabase,
	}),
});

export const dummySchema = dummyKysely.schema;

export const closeDummyDatabase = async (): Promise<void> =>
	dummyKysely.destroy().then(() => void dummyDatabase.close());
