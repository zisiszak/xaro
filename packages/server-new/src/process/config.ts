import arg from 'arg';
import { newError } from 'exitus';
import { createGuard, is } from 'is-guard';
import { homedir } from 'os';
import path from 'path';
import { cleanInt, readAndParseJson } from '~/utils/index.js';

interface Args {
	'--config-file'?: string;
	'--port'?: number;
	'--host'?: string;
	'--root-dir'?: string;
	'--web-client-dir'?: string;
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
	'--port': Number,
	'--host': String,
	'--root-dir': String,
	'--web-client-dir': String,
	'--ffmpeg-path': String,
	'--ffprobe-path': String,

	'-c': '--config-file',
	'-p': '--port',
	'-h': '--host',
} satisfies {
	[K in keyof Args]: K extends `--${string}`
		? ConstructorType<Args[K]>
		: Extract<keyof Args, `--${string}`> | ConstructorType<Args[K]>;
};
const getArgs = (): Args => arg(argSpec);

interface PluginReferenceOptions {
	disabled?: boolean;
	customConfig?: any;
}
export interface CustomPluginLaunchReference extends PluginReferenceOptions {
	/** Absolute path to the package directory */
	path: string;
}
export interface NamedPluginLaunchReference extends PluginReferenceOptions {
	/** The name of the plugin that matches the package name located in the <LIBRARY DIR>/plugins/packages directory */
	name: string;
}
export type PluginLaunchReference = CustomPluginLaunchReference | NamedPluginLaunchReference;

export interface ConfigFile {
	rootDir: string;
	// webClientDir: string;
	/**
	 * The port the server will listen on
	 */
	port: number;
	/**
	 * The host the server will listen on
	 */
	host: string;

	plugins?: PluginLaunchReference[];

	ffmpegPath?: string;
	ffprobePath?: string;
}
const isConfigFile = createGuard.objectWithProps<ConfigFile>({
	required: {
		rootDir: is.string,
		port: is.number,
		host: is.string,
		// webClientDir: is.string,
	},
	optional: {
		ffmpegPath: is.string,
		ffprobePath: is.string,
		// TODO: Fix this
		plugins: (_v: any): _v is PluginLaunchReference[] => true,
	},
	noExtraKeys: true,
});

export interface ServerConfig {
	get rootDir(): string;

	get ffmpegPath(): string | undefined;
	get ffprobePath(): string | undefined;

	httpServer: {
		get host(): string;
		get port(): number;
	};
}

export async function getServerConfig(): Promise<ServerConfig> {
	if (typeof process.env.JWT_SECRET !== 'string') {
		return Promise.reject(
			newError({
				message: 'JWT_SECRET environment variable is not defined!',
				log: 'fatal',
			}),
		);
	}

	const args = getArgs();

	const configFile = args['--config-file']
		? await readAndParseJson(args['--config-file'], isConfigFile)
		: null;

	const serverConfig: ServerConfig = {
		get rootDir() {
			return (
				args['--root-dir'] ??
				configFile?.rootDir ??
				process.env.ROOT_DIR ??
				path.join(homedir(), 'xaro')
			);
		},
		get ffmpegPath() {
			return args['--ffmpeg-path'] ?? configFile?.ffmpegPath ?? process.env.FFMPEG_PATH;
		},
		get ffprobePath() {
			return args['--ffprobe-path'] ?? configFile?.ffprobePath ?? process.env.FFPROBE_PATH;
		},
		httpServer: {
			get port() {
				return cleanInt(args['--port'] ?? configFile?.port ?? process.env.PORT) ?? 3000;
			},
			get host() {
				return args['--host'] ?? configFile?.host ?? process.env.HOST ?? 'localhost';
			},
		},
	};

	return serverConfig;
}
