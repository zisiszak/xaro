import { type PluginModuleKind } from '../index.js';
import { loadGenericPlatformsManager } from './generic-platforms-manager.js';
import { loadPlatformContentExtractor } from './platform-content-extractor.js';
import { loadPlatformManager } from './platform-manager.js';
import { loadPlatformMetadataExtractor } from './platform-metadata-extractor.js';
import { type PluginModuleHandler } from './shared/index.js';

export * from './generic-platforms-manager.js';
export * from './platform-content-extractor.js';
export * from './platform-manager.js';
export * from './platform-metadata-extractor.js';
export * from './shared/index.js';

export const pluginModuleHandlers = {
	'platform-manager': loadPlatformManager,
	'external-api-authorisation': null,
	'generic-platforms-manager': loadGenericPlatformsManager,
	'platform-content-extractor': loadPlatformContentExtractor,
	'platform-metadata-extractor': loadPlatformMetadataExtractor,
	'platform-referencer': null,
} satisfies {
	[K in PluginModuleKind]: PluginModuleHandler<K> | null;
};
