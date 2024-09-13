import { type AnyLoadedPluginModule, type AnyPluginModule } from './plugin-modules/shared.js';

export interface PluginModules {
	[key: string]: AnyPluginModule;
}

export interface Plugin {
	name: string;
	displayName: string;
	description?: string;
	modules: PluginModules;
}

export interface LoadedPlugin {
	name: string;
	displayName: string;
	description: string | null;
	loadedModules: Map<string, AnyLoadedPluginModule>;
}
