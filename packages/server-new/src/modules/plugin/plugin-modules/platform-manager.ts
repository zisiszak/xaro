import {
	type LoadedPluginModuleInfo,
	type PluginModuleInfo,
	type UrlSourceIdentifierMatch,
} from './shared.js';

export interface PlatformManager extends PluginModuleInfo<'platform-manager'> {
	platformDetails: Readonly<{
		name: string;
		displayName: string;
		description?: string;
		homeUrl: string;
	}>;

	matchToUrls: UrlSourceIdentifierMatch;
}

export type LoadedPlatformManager = PlatformManager &
	LoadedPluginModuleInfo<'platform-manager'> & {
		platformID: number;
	};
