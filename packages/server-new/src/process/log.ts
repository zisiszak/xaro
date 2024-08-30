import { exitus } from 'exitus';
import path from 'path';
import pino, { type TransportSingleOptions } from 'pino';
import type PinoPretty from 'pino-pretty';
import { type XaroProcess } from './index.js';

export const initLog = (): {
	pinoLogger: pino.Logger<never>;
	logMap: XaroProcess['log'];
	exit: XaroProcess['exit'];
} => {
	const defaultPinoTransport = {
		target: './log.pino-pretty-transport.js',
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
						destination: path.join(process.env.ROOT_DIRECTORY, 'logs', 'default.log'),
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
				pino.destination(path.join(process.env.ROOT_DIRECTORY, 'logs', 'exit.log')),
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
};
