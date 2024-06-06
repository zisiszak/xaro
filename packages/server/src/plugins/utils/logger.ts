import { logger } from '../../index.js';

export interface PluginLogger {
	readonly info: (data: any, msg?: string) => void;
	readonly warn: (data: any, msg?: string) => void;
	readonly error: (data: any, msg?: string) => void;
	readonly fatal: (data: any, msg?: string) => void;
	readonly debug: (data: any, msg?: string) => void;
}

const createLoggerFactory =
	(plugin: string) =>
	(kind: 'info' | 'warn' | 'error' | 'fatal' | 'debug') =>
	(data: any, msg?: string) => {
		if (typeof data === 'string') {
			logger[kind](`${plugin} - ${data}`);
			return;
		}

		let message = msg;
		if (
			!message &&
			typeof data === 'object' &&
			'message' in data &&
			typeof data.message === 'string'
		) {
			message = data.message;
		}

		logger[kind](data, `${plugin} - ${message}`);
	};

export function createPluginLogger(plugin: string) {
	const createLogger = createLoggerFactory(plugin);
	const logger: PluginLogger = {
		info: createLogger('info'),
		warn: createLogger('warn'),
		error: createLogger('error'),
		fatal: createLogger('fatal'),
		debug: createLogger('debug'),
	};
	return logger;
}
