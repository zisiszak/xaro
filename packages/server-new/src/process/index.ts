import SQLite from 'better-sqlite3';
import { exitus, type GenericError, isError, newError } from 'exitus';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import path from 'path';
import pino, { type TransportSingleOptions } from 'pino';
import type PinoPretty from 'pino-pretty';
import { Db } from '~/models/database/index.js';
import { sequentialAsync } from '~/utils/sequential-async.js';
import { getServerConfig, type ServerConfig } from './config.js';

export * from './http-server.js';
export * from './internal-params.js';

export interface XaroProcess {
	log: Record<
		'info' | 'debug' | 'warn' | 'fatal' | 'error',
		(msgOrData?: any, data?: any) => void
	>;
	config: ServerConfig;
	exit(message?: string, data?: any): never;
	exit(data?: any): never;
	db: Kysely<Db.Schema>;
}

export async function initProcess(): Promise<XaroProcess> {
	const config = await getServerConfig();
	const { logMap: log, exit } = initLogging(config);
	const db = await initDatabase(config);

	if (isError(db)) {
		return exit('Failed to initialise database.', db);
	}

	const xaroProcess: XaroProcess = {
		exit: exit,
		log: log,
		db,
		config,
	};
	return xaroProcess;
}

function initLogging(config: ServerConfig): {
	pinoLogger: pino.Logger<never>;
	logMap: XaroProcess['log'];
	exit: XaroProcess['exit'];
} {
	const defaultPinoTransport = {
		target: './pino-pretty-transport.js',
		options: {
			destination: 1,
		} satisfies PinoPretty.PrettyOptions,
	} satisfies TransportSingleOptions;

	const pinoLogger = pino.pino({
		timestamp: pino.stdTimeFunctions.isoTime,
		messageKey: 'message',
		edgeLimit: 10,
		transport: {
			targets: [
				defaultPinoTransport,
				{
					...defaultPinoTransport,
					options: {
						mkdir: true,
						append: true,
						sync: false,
						destination: path.join(config.rootDir, 'logs', 'default.log'),
					},
				},
			],
		},
	});

	const logMap: XaroProcess['log'] = {
		debug: pinoLogger.debug.bind(pinoLogger),
		fatal: pinoLogger.fatal.bind(pinoLogger),
		warn: pinoLogger.warn.bind(pinoLogger),
		info: pinoLogger.info.bind(pinoLogger),
		error: pinoLogger.error.bind(pinoLogger),
	};

	const onExitCallback: XaroProcess['exit'] = (messageOrData?: any, data?: any): never => {
		if (!!messageOrData || !!data) {
			const exitFileLogger = pino.pino(
				{
					timestamp: pino.stdTimeFunctions.isoTime,
				},
				pino.destination(path.join(config.rootDir, 'logs', 'exit.log')),
			);
			const exitStdoutLogger = pino.pino({}, pino.destination());

			let msg: string | undefined = undefined;
			let obj: unknown = undefined;
			if (typeof messageOrData === 'string') {
				msg = messageOrData;
				obj = data;
			} else {
				obj = messageOrData;
			}

			exitFileLogger.info(obj, msg);
			exitStdoutLogger.info(obj, msg);
		}

		process.exit(1);
	};

	exitus.setLogConfig(logMap);

	return {
		logMap: logMap,
		exit: onExitCallback,
		pinoLogger: pinoLogger,
	};
}

async function initDatabase(config: ServerConfig): Promise<Kysely<Db.Schema> | GenericError> {
	const connection = new SQLite(path.join(config.rootDir, 'index.db'), {
		fileMustExist: false,
	});
	connection.pragma('journal_mode = WAL');

	const db = new Kysely<Db.Schema>({
		plugins: [new ParseJSONResultsPlugin()],
		dialect: new SqliteDialect({
			database: connection,
		}),
	});

	return sequentialAsync(
		async (table) =>
			await table.init(db as Kysely<unknown>).catch((err) => {
				throw newError({
					caughtException: err,
					message: `Failed to create database table using query creator function: ${table.name}`,
				});
			}),
		Db.tableOrder,
	)
		.then(() => {
			return db;
		})
		.catch((err: GenericError) => err);
}
