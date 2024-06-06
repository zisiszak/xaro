import PinoPretty from 'pino-pretty';

// type Prettifier = (
// 	input: string | number,
// 	key: string,
// 	log: any,
// 	extras: {
// 		colors: Colorette;
// 		label?: string;
// 		labelColorized?: string;
// 	},
// ) => string;

// const prettifyTime: Prettifier = (input, _key, _log, { colors }) =>
// 	`${colors.white(input)}`;
// const prettifyLevel: Prettifier = (
// 	logLevel,
// 	_key,
// 	_log,
// 	{ labelColorized, colors },
// ) => {
// 	if (logLevel === 60) {
// 		return `${colors.bold(colors.bgWhiteBright(labelColorized!))}`;
// 	}
// 	if (logLevel === 50) {
// 		return `${colors.bold(labelColorized!)}`;
// 	}
// 	return labelColorized!;
// };
// const prettifyMessage: Prettifier = (message, _key, _log, { colors }) =>
// 	colors.italic(colors.whiteBright(message));

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
