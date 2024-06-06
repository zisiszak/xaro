import { ConstructorType } from '~/utils/types-and-guards/index.js';

export interface LaunchConfigurationArgs {
	'--config-file'?: string;
	'--port'?: number;
	'--host'?: string;
	'--library-dir'?: string;
	'--web-client-build-dir'?: string;
	'--ffmpeg-path'?: string;
	'--ffprobe-path'?: string;

	/** Alias for `--config-file` */
	'-c'?: string;
	/** Alias for `--port` */
	'-p'?: number;
	/** Alias for `--host` */
	'-h'?: string;
}

export const launchConfigurationArgs = {
	'--config-file': String,
	'--port': Number,
	'--host': String,
	'--library-dir': String,
	'--web-client-build-dir': String,
	'--ffmpeg-path': String,
	'--ffprobe-path': String,

	'-c': '--config-file',
	'-p': '--port',
	'-h': '--host',
} satisfies {
	[K in keyof LaunchConfigurationArgs]: K extends `--${string}`
		? ConstructorType<LaunchConfigurationArgs[K]>
		:
				| Extract<keyof LaunchConfigurationArgs, `--${string}`>
				| ConstructorType<LaunchConfigurationArgs[K]>;
};
