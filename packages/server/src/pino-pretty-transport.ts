import PinoPretty from 'pino-pretty';

export default async (options: PinoPretty.PrettyOptions) =>
	import('pino-pretty').then((pinoPretty) =>
		(pinoPretty.default as any)({
			crlf: true,
			levelFirst: true,
			messageKey: 'message',
			errorLikeObjectKeys: ['error', 'caughtException'],
			minimumLevel: 'debug',
			ignore: 'pid,hostname',
			timestampKey: 'time',
			customColors: `info:blueBright,warn:yellowBright,error:redBright,debug:gray,fatal:red,message:greenBright`,
			colorizeObjects: true,
			singleLine: false,
			translateTime: 'SYS:ddmmyy" at "HH:MM:ss.l',
			...options,
		}),
	);
