import arg from 'arg';
import SQLite from 'better-sqlite3';
import { exitus, isError } from 'exitus';
import { access, writeFile } from 'fs/promises';
import { Kysely, SqliteDialect, type InsertResult, type LogEvent } from 'kysely';
import path from 'path';
import { pino, type Logger, type TransportSingleOptions } from 'pino';
import PinoPretty from 'pino-pretty';
import { startApp } from './app.js';
import { updateServerConfig } from './config/index.js';
import { launchConfigurationArgs } from './config/launch-args.js';
import { type Database, type DatabaseSchema } from './data/model/database.js';
import { createContentTable } from './data/model/tables/Content.js';
import { createMediaFileTable } from './data/model/tables/ContentFile.js';
import { createMediaUploadTable } from './data/model/tables/ContentUpload.js';
import { createContentUserStatsTable } from './data/model/tables/ContentUserStats.js';
import { createGroupingPlaylistTable } from './data/model/tables/GroupingPlaylist.js';
import { createGroupingPlaylistLinkedContentTable } from './data/model/tables/GroupingPlaylistLinkedContent.js';
import { createPersonTable } from './data/model/tables/Person.js';
import { createPlatformTable } from './data/model/tables/Platform.js';
import { createPlatformCommunityTable } from './data/model/tables/PlatformCommunity.js';
import { createPlatformLinkedMediaTable } from './data/model/tables/PlatformLinkedContent.js';
import { createPlatformProfileTable } from './data/model/tables/PlatformProfile.js';
import { createPluginTable } from './data/model/tables/Plugin.js';
import { createSortingCategoryTable } from './data/model/tables/SortingCategory.js';
import { createSortingGenreTable } from './data/model/tables/SortingGenre.js';
import { createSortingTagTable } from './data/model/tables/SortingTag.js';
import { createSortingTagLinkedContentTable } from './data/model/tables/SortingTagLinkedContent.js';
import { createUserTable } from './data/model/tables/User.js';
import { createUserContentTable } from './data/model/tables/UserLinkedContent.js';
import { createUserLinkedPlatformTable } from './data/model/tables/UserLinkedPlatform.js';
import { createUserLinkedPlatformCommunityTable } from './data/model/tables/UserLinkedPlatformCommunity.js';
import { createUserLinkedPlatformProfileTable } from './data/model/tables/UserLinkedPlatformProfile.js';
import { generateMissingThumbnails } from './services/content/generate-content-thumbnails.js';
import { optimiseAllGeneratedThumbnails } from './services/content/optimisation/optimise-generated-thumbnails.js';
import { sequentialAsync } from './utils/async/sequential-async.js';
import { mkdirDefaults } from './utils/fs/index.js';

const args = arg(launchConfigurationArgs);

const defaultLoggerTransport = {
	target: './pino-pretty-transport.js',
	options: {
		destination: 1,
	} satisfies PinoPretty.PrettyOptions,
} satisfies TransportSingleOptions;

export let logger: Logger<never> = pino({
	transport: {
		targets: [defaultLoggerTransport],
	},
});
exitus.setLogConfig({
	debug: logger.debug,
	error: logger.error,
	fatal: logger.fatal,
	info: logger.info,
	warn: logger.warn,
});

export const config = await updateServerConfig(args).then((config) => {
	if (isError(config)) {
		logger.fatal(config, 'Failed to load config');
		process.exit(1);
	}
	return config;
});
const logFileDestination = path.join(config.logDir, 'server.log');
await access(logFileDestination).catch(() =>
	mkdirDefaults(config.logDir).then(() => writeFile(logFileDestination, '')),
);

logger.removeAllListeners();

logger = pino({
	timestamp: pino.stdTimeFunctions.isoTime,
	messageKey: 'message',
	edgeLimit: 10,
	transport: {
		targets: [
			defaultLoggerTransport,
			{
				...defaultLoggerTransport,
				options: {
					destination: logFileDestination,
					mkdir: true,
					append: true,
					sync: false,
				},
			} as TransportSingleOptions,
		],
	},
});

const quitFileLogger = pino(
	{
		timestamp: pino.stdTimeFunctions.isoTime,
	},
	pino.destination(logFileDestination),
);
const quitStdoutLogger = pino({}, pino.destination());
export const quit = ({
	log,
	kind,
}: {
	log?: {
		obj?: unknown;
		msg?: string;
	};
	kind: 'fatal';
}): never => {
	if (log) {
		const { obj, msg } = log;

		const logKind = kind === 'fatal' ? 'fatal' : 'debug';
		quitFileLogger[logKind](obj, msg);
		quitStdoutLogger[logKind](msg, 'Check the log file for potential additional information.');
	}

	process.exit(kind === 'fatal' ? 1 : 0);
};

await mkdirDefaults(
	config.libraryDir,
	config.mediaDir,
	config.awaitingImportDir,
	config.platformsDir,
	config.logDir,
)
	.then((result) => {
		if (result.length !== 0) {
			logger.info(result, 'Default directories created');
		}
	})
	.catch((err) => {
		quit({
			log: {
				msg: 'Failed to create required library directories.',
				obj: err,
			},
			kind: 'fatal',
		});
	});

export const db = new Kysely<DatabaseSchema>({
	dialect: new SqliteDialect({
		database: new SQLite(config.databaseFile, {
			fileMustExist: false,
		}),
	}),
	log: ({ level, ...rest }: LogEvent) =>
		level === 'query'
			? logger.debug(rest, 'Database query')
			: level === 'error'
				? logger.error(
						{
							message: 'Database query error',
							query: rest.query.query,
							params: rest.query.parameters,
							duration: rest.queryDurationMillis,
						},
						decodeURI(rest.query.sql),
					)
				: void 0,
});

await sequentialAsync<
	(db: Database) => Promise<InsertResult[] | void>,
	InsertResult[] | void,
	true
>(
	(createTable) => createTable(db),
	[
		createPluginTable,
		createPlatformTable,
		createPlatformCommunityTable,
		createPlatformProfileTable,
		createPlatformLinkedMediaTable,
		createUserTable,
		createContentTable,
		createMediaFileTable,
		createContentUserStatsTable,
		createUserContentTable,
		createMediaUploadTable,
		createPersonTable,
		createUserLinkedPlatformTable,
		createUserLinkedPlatformCommunityTable,
		createUserLinkedPlatformProfileTable,
		createSortingCategoryTable,
		createSortingGenreTable,
		createSortingTagTable,
		createGroupingPlaylistTable,
		createGroupingPlaylistLinkedContentTable,
		createSortingTagLinkedContentTable,
	],
	true,
).then((results) => {
	const errors = results.filter(isError);
	if (errors.length !== 0) {
		quit({
			log: {
				obj: errors,
				msg: `${errors.length} error(s) creating database tables`,
			},
			kind: 'fatal',
		});
	}
});

export const app = startApp(config);

await generateMissingThumbnails()
	.then(() => optimiseAllGeneratedThumbnails())
	.catch((err) => logger.error(err));
