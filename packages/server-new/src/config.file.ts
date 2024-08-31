import { createGuard, is } from 'is-guard';
import { readAndParseJson } from '~/utils/fs.js';

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
	rootDirectory: string;
	// webClientDir: string;
	/**
	 * The port the server will listen on
	 */
	httpPort: number;
	/**
	 * The host the server will listen on
	 */
	httpHostname: string;

	plugins?: PluginLaunchReference[];

	ffmpegPath?: string;
	ffprobePath?: string;
}
const isConfigFile = createGuard.objectWithProps<ConfigFile>({
	required: {
		rootDirectory: is.string,
		httpPort: is.number,
		httpHostname: is.string,
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

export const loadConfigFile = async (): Promise<void> => {
	if (process.env.CONFIG_FILEPATH)
		await readAndParseJson(process.env.CONFIG_FILEPATH, isConfigFile).then(
			({ ffmpegPath, ffprobePath, httpHostname, httpPort, rootDirectory }) => {
				ffmpegPath && (process.env.FFMPEG_PATH = ffmpegPath);
				ffprobePath && (process.env.FFPROBE_PATH = ffprobePath);
				httpHostname && (process.env.HTTP_HOSTNAME = httpHostname);
				httpPort && (process.env.HTTP_PORT = httpPort.toString());
				rootDirectory && (process.env.ROOT_DIRECTORY = rootDirectory);
			},
		);
};
