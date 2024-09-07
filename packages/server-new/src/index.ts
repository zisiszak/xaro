/* eslint-disable prefer-const */
import { type Kysely } from 'kysely';
import { join } from 'path';
import type pino from 'pino';
import { loadConfigArgs } from './config.args.js';
import { loadConfigFile } from './config.file.js';
import { setDefaultEnvironmentVariablesIfNotExist, validateEnvironmentVariables } from './env.js';
import { startHttpServer } from './http/index.js';
import {
	newFileAndStdoutLogger,
	newStdoutLogger,
	pinoToServerLog,
	type ServerLogger,
} from './log.js';
import { connectToDatabase } from './modules/database.init.js';
import { type DatabaseSchema } from './modules/database.schema.js';
import { defaultFileFormats } from './modules/files/index.js';
import { fileFormatRepository } from './modules/files/repositories/file-format.repository.js';
import { fileFS } from './modules/files/repositories/file.fs.js';
import { mkdirDefaults, mkdirRecursive } from './utils/fs.js';

let pinoLogger: pino.Logger = newStdoutLogger();

export let logger: ServerLogger = pinoToServerLog(pinoLogger);

export let database: Kysely<DatabaseSchema>;

// Init

setDefaultEnvironmentVariablesIfNotExist();
loadConfigArgs();
await loadConfigFile();

await validateEnvironmentVariables();

await mkdirRecursive(process.env.ROOT_DIRECTORY);

pinoLogger.flush(() => {
	pinoLogger.removeAllListeners();

	pinoLogger = newFileAndStdoutLogger(join(process.env.ROOT_DIRECTORY, 'xaro.log'));
	logger = pinoToServerLog(pinoLogger);
});

database = await connectToDatabase();

await fileFormatRepository.saveOrUpdate(defaultFileFormats);
await mkdirDefaults(fileFS.tempDirectory, fileFS.filesDirectory);

// 2. Load plugins

// 3. Start listening
export const server = startHttpServer();
