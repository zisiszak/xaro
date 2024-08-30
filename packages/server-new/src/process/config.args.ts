import arg from 'arg';

interface Args {
	'--config-file'?: string;
	'--http-port'?: number;
	'--http-hostname'?: string;
	'--root-dir'?: string;
	'--ffmpeg-path'?: string;
	'--ffprobe-path'?: string;

	/** Alias for `--config-file` */
	'-c'?: string;
	/** Alias for `--port` */
	'-p'?: number;
	/** Alias for `--host` */
	'-h'?: string;
}
const argSpec = {
	'--config-file': String,
	'--http-port': Number,
	'--http-hostname': String,
	'--root-dir': String,
	'--ffmpeg-path': String,
	'--ffprobe-path': String,

	'-c': '--config-file',
	'-p': '--http-port',
	'-h': '--http-hostname',
} satisfies {
	[K in keyof Args]: K extends `--${string}`
		? ConstructorType<Args[K]>
		: Extract<keyof Args, `--${string}`> | ConstructorType<Args[K]>;
};
const getArgs = (): Args => arg(argSpec);

export const loadConfigArgs = (): void => {
	const args = getArgs();

	args['--config-file'] && (process.env.CONFIG_FILEPATH = args['--config-file']);
	args['--ffmpeg-path'] && (process.env.FFMPEG_PATH = args['--ffmpeg-path']);
	args['--ffprobe-path'] && (process.env.FFPROBE_PATH = args['--ffprobe-path']);
	args['--http-hostname'] && (process.env.HTTP_HOSTNAME = args['--http-hostname']);
	args['--http-port'] && (process.env.HTTP_PORT = args['--http-port'].toString());
	args['--root-dir'] && (process.env.ROOT_DIRECTORY = args['--root-dir']);
};
