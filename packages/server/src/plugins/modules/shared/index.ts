import { type Guard } from 'is-guard';
import {
	GenericPlatformsManager,
	GenericPlatformsManagerConfig,
} from '../generic-platforms-manager.js';
import {
	type PlatformContentExtractor,
	type PlatformContentExtractorConfig,
} from '../platform-content-extractor.js';
import {
	type PlatformManager,
	type PlatformManagerConfig,
} from '../platform-manager.js';
import {
	type PlatformMetadataExtractor,
	type PlatformMetadataExtractorConfig,
} from '../platform-metadata-extractor.js';
import { type LinkModuleReferencesCallback } from './link-references.js';

export * from './functions.js';
export * from './link-references.js';

export const pluginModuleKinds = [
	'platform-manager',
	'generic-platforms-manager',
	'platform-content-extractor',
	'platform-metadata-extractor',
	'platform-referencer',
	'external-api-authorisation',
] as const;
export type PluginModuleKind = (typeof pluginModuleKinds)[number];

export type PluginModuleReference = `${string}.${string}`;

/**
 * Properties `kind` and `name` must match one of the defined `PluginModuleManifest` items, otherwise the module will not be permitted to load.
 */
export interface PluginModuleManifest<Kind extends PluginModuleKind> {
	kind: Kind;
	name: string;

	displayName: string;
	description?: string | null;

	/**
	 * If the module fails to load, but `optional` is set to `true`, the plugin will continue loading.
	 * @default false
	 */
	optional?: boolean;
}

export interface PluginModuleConfig<Kind extends PluginModuleKind> {
	kind: Kind;
	name: string;
}

export interface PluginModule<Kind extends PluginModuleKind> {
	kind: Kind;
	name: string;
	displayName: string;
	description: string | null;

	pluginId: number;
	pluginName: string;

	optional: boolean;
}

export type AnyPluginModuleConfig =
	| PlatformManagerConfig
	| PlatformContentExtractorConfig
	| PlatformMetadataExtractorConfig
	| GenericPlatformsManagerConfig;
export type MappedPluginModuleConfig<Kind extends PluginModuleKind> = Extract<
	AnyPluginModuleConfig,
	PluginModuleConfig<Kind>
>;

export type AnyPluginModule =
	| PlatformManager
	| PlatformContentExtractor
	| PlatformMetadataExtractor
	| GenericPlatformsManager;
export type MappedPluginModule<Kind extends PluginModuleKind> = Extract<
	AnyPluginModule,
	PluginModule<Kind>
>;

/**
 * Returns null only if a module does not load and `optional` is set to `true`. If this throws, attempting to call it again will result in a property access error.
 */
export type PluginModuleLoaderCallback = <Kind extends PluginModuleKind>(
	moduleConfig: MappedPluginModuleConfig<Kind>,
) => void | null;

export type PluginModuleHandler<Kind extends PluginModuleKind> = (
	moduleConfig: MappedPluginModuleConfig<Kind>,
	context: {
		pluginName: string;
		pluginId: number;
	},
) => Promise<{
	loadedProps: Omit<MappedPluginModule<Kind>, keyof PluginModule<Kind>>;
	linkModuleReferences: LinkModuleReferencesCallback<Kind> | null;
}>;

export interface PluginFunctionDeclaration<Input, Func> {
	func: Func;
	guard: Guard<Input>;
}
