import { loadBasicExtractor } from './basic-extractor.js';
import {
	type MappedPluginModule,
	type PluginModuleKind,
	type PluginModuleLoaderFunction,
} from './shared.js';

export const pluginModuleLoaders: {
	[K in PluginModuleKind]?: PluginModuleLoaderFunction<MappedPluginModule<K>>;
} = {
	'basic-extractor': loadBasicExtractor,
} as const;
