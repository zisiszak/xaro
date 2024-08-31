import pino from 'pino';

export type ServerLogger = {
	[key in 'info' | 'warn' | 'error' | 'debug' | 'fatal']: pino.pino.LogFn;
};
export const pinoToServerLog = (logger: pino.Logger): ServerLogger => {
	const serverLogger: ServerLogger = Object.freeze({
		info: logger.info.bind(logger),
		warn: logger.warn.bind(logger),
		error: logger.error.bind(logger),
		debug: logger.debug.bind(logger),
		fatal: logger.debug.bind(logger),
	});

	return serverLogger;
};

export const newStdoutLogger = (): pino.Logger =>
	pino.pino({
		timestamp: pino.stdTimeFunctions.epochTime,
		messageKey: 'message',
		edgeLimit: 10,
		transport: {
			target: './log.pino-pretty-transport.js',
			options: {
				destination: 1,
			},
		},
	});

export const newFileAndStdoutLogger = (logFilePath: string): pino.Logger =>
	pino.pino({
		timestamp: pino.stdTimeFunctions.epochTime,
		messageKey: 'message',
		edgeLimit: 10,
		transport: {
			targets: [
				{
					target: './log.pino-pretty-transport.ts',
					options: {
						destination: 1,
					},
				},
				{
					target: 'pino/file',
					options: {
						mkdir: true,
						append: true,
						sync: false,
						destination: logFilePath,
					},
				},
			],
		},
	});
