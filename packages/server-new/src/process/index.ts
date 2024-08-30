import { type Kysely } from 'kysely';
import { initDatabase } from '~/modules/database.init.js';
import { type DatabaseSchema } from '~/modules/database.schema.js';
import { mkdirRecursive } from '~/utils/fs.js';
import { loadConfigArgs } from './config.args.js';
import { loadConfigFile } from './config.file.js';
import { setDefaultEnv, validateEnv } from './env.js';
import { initLog } from './log.js';

export interface XaroProcess {
	log: Record<
		'info' | 'debug' | 'warn' | 'fatal' | 'error',
		(msgOrData?: any, data?: any) => void
	>;
	exit(message?: string, data?: any): never;
	exit(data?: any): never;
	db: Kysely<DatabaseSchema>;
}

export const init = async (): Promise<XaroProcess> => {
	setDefaultEnv();

	loadConfigArgs();
	await loadConfigFile();

	validateEnv();

	const { logMap: log, exit } = initLog();

	await mkdirRecursive(process.env.ROOT_DIRECTORY);

	const db = await initDatabase().catch((err) => exit('Failed to initialise database.', err));

	const xaroProcess: XaroProcess = {
		exit: exit,
		log: log,
		db,
	};
	return xaroProcess;
};
