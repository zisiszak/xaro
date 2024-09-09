import { type URL } from 'url';

export interface PluginModuleInfo {
	name: string;
	description?: string;
}

export type UrlSourceIdentifier = URL;
export type IdSourceIdentifier = string;

export type IdSourceIdentifierMatchingFunction = (input: string) => boolean;
export type UrlSourceIdentifierMatchingFunction = (input: URL) => boolean;

export type IdSourceIdentifierMatch = IdSourceIdentifierMatchingFunction;
export type UrlSourceIdentifierMatch = string | RegExp | UrlSourceIdentifierMatchingFunction;

export type DropdownOption = Readonly<{
	displayName: string;
	value: string;
}>;
