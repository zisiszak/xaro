import {
	type PluginModuleKind,
	type PluginModuleLoaderCallback,
	type PluginModuleManifest,
} from './modules/index.js';
import { type PluginLogger } from './utils/logger.js';

export interface PluginManifest {
	name: string;
	version: string;
	displayName: string;
	description?: string | null;

	modules: PluginModuleManifest<PluginModuleKind>[];

	dependencies?: { name: string }[];
}

export interface PluginStartCallbackParams<CustomConfig = null> {
	previousVersion: string | null;
	currentVersion: string;
	customConfig: CustomConfig;
	loadModule: PluginModuleLoaderCallback;

	pluginDir: string;
	pluginLogger: PluginLogger;
}
export type PluginStartCallback<CustomConfig = null> = (
	params: PluginStartCallbackParams<CustomConfig>,
) => void;

export type Plugin<CustomConfig = null> = {
	manifest: PluginManifest;
	customConfig: CustomConfig | null;
	onStart: PluginStartCallback<CustomConfig>;
};

export type ExecutePlugin<CustomConfig = null> = (
	customConfig?: CustomConfig,
) => Plugin<CustomConfig>;

export * from './loader.js';
export * from './modules/index.js';

export type * from './utils/index.js';
