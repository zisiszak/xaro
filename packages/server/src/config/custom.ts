import { createGuard, is } from 'is-guard';
import { FfmpegConfig, ffmpeg } from '~/libs/ffmpeg/index.js';

export interface LibsConfiguration {
	/**
	 * Optional ffmpeg configuration if you have a custom ffmpeg installation. Otherwise, defaults to the paths detected by `fluent-ffmpeg`.
	 */
	ffmpeg?: FfmpegConfig;
}

export interface ConfigurationFile {
	libraryDir: string;
	/**
	 * The port the server will listen on
	 */
	port: number;
	/**
	 * The host the server will listen on
	 */
	host: string;

	libs?: LibsConfiguration;
}

export const isConfigurationFile =
	createGuard.objectWithProps<ConfigurationFile>({
		required: {
			libraryDir: is.string,
			port: is.number,
			host: is.string,
		},
		optional: {
			libs: (value: any): value is LibsConfiguration =>
				is.objectWithProps<LibsConfiguration>(value, {
					optional: {
						ffmpeg: ffmpeg.isConfig,
					},
				}),
		},
		noExtraKeys: true,
	});
