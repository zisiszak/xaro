import { type URL } from 'url';
import { returnTrue } from '~/utils/always-true.js';
import {
	type BasicExtractor,
	type BasicExtractorFeatures,
	type LoadedBasicExtractor,
} from './basic-extractor.js';
import {
	type BulkExtractor,
	type BulkExtractorFeatures,
	type LoadedBulkExtractor,
} from './bulk-extractor.js';
import { type LoadedPlatformManager, type PlatformManager } from './platform-manager.js';
import {
	type LoadedPlaylistExtractor,
	type PlaylistExtractor,
	type PlaylistExtractorFeatures,
} from './playlist-extractor.js';

const pluginModuleKinds = [
	'basic-extractor',
	'bulk-extractor',
	'playlist-extractor',
	'platform-manager',
] as const;
export const pluginModuleKindSet: Set<PluginModuleKind> = new Set(pluginModuleKinds);
export type PluginModuleKind = (typeof pluginModuleKinds)[number];
export interface PluginModuleInfo<K extends PluginModuleKind> {
	kind: K;
	displayName: string;
	description?: string;
	/**
	 * If the module fails to load, but `optional` is set to `true`, the plugin will continue loading.
	 * @default false
	 */
	optional?: boolean;
}
export interface LoadedPluginModuleInfo<K extends PluginModuleKind> {
	id: PluginModuleReference;
	kind: K;
	name: string;
	displayName: string;
	description: string | null;
	optional: boolean;
}

export type AnyPluginModule =
	| BulkExtractor<BulkExtractorFeatures>
	| BasicExtractor<BasicExtractorFeatures>
	| PlaylistExtractor<PlaylistExtractorFeatures>
	| PlatformManager;
export type AnyLoadedPluginModule =
	| LoadedBasicExtractor
	| LoadedBulkExtractor
	| LoadedPlatformManager
	| LoadedPlaylistExtractor;

export type MappedPluginModule<K extends PluginModuleKind> = Extract<AnyPluginModule, { kind: K }>;
export type MappedLoadedPluginModule<K extends PluginModuleKind> = Extract<
	AnyLoadedPluginModule,
	{ kind: K }
>;

export type PluginModuleLoaderFunction<M extends AnyPluginModule> = (
	module: M,
	baseLoadedModuleInfo: LoadedPluginModuleInfo<M['kind']>,
) => Promise<MappedLoadedPluginModule<M['kind']>> | MappedLoadedPluginModule<M['kind']>;

export type UrlSourceIdentifier = URL;
export type IdSourceIdentifier = string;

export type IdSourceIdentifierMatchingFunction = (input: string) => boolean;
export type UrlSourceIdentifierMatchingFunction = (input: URL) => boolean;

export type IdSourceIdentifierMatch = IdSourceIdentifierMatchingFunction;
export type UrlSourceIdentifierMatch = string | RegExp | UrlSourceIdentifierMatchingFunction;

export function urlSourceIdentifierMatchAsFunction(
	input: UrlSourceIdentifierMatch | true,
): UrlSourceIdentifierMatchingFunction {
	if (typeof input === 'function') return input;
	if (typeof input === 'string') return (v: URL) => v.toString().startsWith(input);
	if (input instanceof RegExp) return (v: URL) => input.test(v.toString());
	return returnTrue;
}

export function idSourceIdentifierMatchAsFunction(
	input: IdSourceIdentifierMatch | true,
): IdSourceIdentifierMatchingFunction {
	if (typeof input === 'function') return input;
	return returnTrue;
}

export type DropdownOption = Readonly<{
	displayName: string;
	value: string;
}>;
