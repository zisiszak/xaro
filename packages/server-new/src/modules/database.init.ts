import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { join } from 'path';
import { FileTable } from '~/modules/files/tables/file.table.js';
import { closeDummyDatabase } from '~/shared/index.js';
import { type DatabaseSchema } from './database.schema.js';
import {
	CreatorTable,
	FileFormatTable,
	FileToMediaTable,
	MediaTable,
	MediaToSortingTagTable,
	PlatformCommunityTable,
	PlatformMediaSourceTable,
	PlatformProfileTable,
	PlatformTable,
	SortingTagTable,
	UserMediaStatsTable,
	UserTable,
	UserToFileTable,
	UserToMediaTable,
	UserToPlatformCommunityTable,
	UserToPlatformProfileTable,
	UserToPlatformTable,
} from './database.tables.js';

const DATABASE_FILENAME = 'index.db';

export const connectToDatabase = async () => {
	const database = new SQLite(join(process.env.ROOT_DIRECTORY, DATABASE_FILENAME), {
		fileMustExist: false,
	});
	database.pragma('journal_mode = WAL');

	const kysely = new Kysely<DatabaseSchema>({
		plugins: [new ParseJSONResultsPlugin()],
		dialect: new SqliteDialect({
			database: database,
		}),
	});

	// create tables
	await kysely.executeQuery(UserTable.compiledCreateTableQuery);
	await kysely.executeQuery(CreatorTable.compiledCreateTableQuery);
	await kysely.executeQuery(FileFormatTable.compiledCreateTableQuery);
	await kysely.executeQuery(FileTable.compiledCreateTableQuery);
	await kysely.executeQuery(UserToFileTable.compiledCreateTableQuery);
	await kysely.executeQuery(PlatformTable.compiledCreateTableQuery);
	await kysely.executeQuery(UserToPlatformTable.compiledCreateTableQuery);
	await kysely.executeQuery(PlatformProfileTable.compiledCreateTableQuery);
	await kysely.executeQuery(UserToPlatformProfileTable.compiledCreateTableQuery);
	await kysely.executeQuery(PlatformCommunityTable.compiledCreateTableQuery);
	await kysely.executeQuery(UserToPlatformCommunityTable.compiledCreateTableQuery);
	await kysely.executeQuery(MediaTable.compiledCreateTableQuery);
	await kysely.executeQuery(PlatformMediaSourceTable.compiledCreateTableQuery);
	await kysely.executeQuery(UserToMediaTable.compiledCreateTableQuery);
	await kysely.executeQuery(UserMediaStatsTable.compiledCreateTableQuery);
	await kysely.executeQuery(FileToMediaTable.compiledCreateTableQuery);
	await kysely.executeQuery(SortingTagTable.compiledCreateTableQuery);
	await kysely.executeQuery(MediaToSortingTagTable.compiledCreateTableQuery);

	await closeDummyDatabase();

	return kysely;
};
