import {
	type DropdownOption,
	type IdSourceIdentifier,
	type IdSourceIdentifierMatch,
	type PluginModuleInfo,
	type UrlSourceIdentifier,
	type UrlSourceIdentifierMatch,
} from './shared.js';

export interface PlaylistExtractorFunctionProps<
	F extends PlaylistExtractorFeatures = PlaylistExtractorFeatures,
> {
	identifier:
		| (F['acceptsIdIdentifier'] extends true | IdSourceIdentifierMatch
				? IdSourceIdentifier
				: never)
		| (F['acceptsUrlIdentifier'] extends true | UrlSourceIdentifierMatch
				? UrlSourceIdentifier
				: never);

	maxItemLimit?: F['maxItemLimiting'] extends true ? number : never;

	itemOrder?: F['itemOrdering'] extends DropdownOption[]
		? F['itemOrdering'][number]['value']
		: never;
}

export type PlaylistExtractorFunction<F extends PlaylistExtractorFeatures> = (
	props: PlaylistExtractorFunctionProps<F>,
) => Promise<unknown>;

export interface PlaylistExtractorFeatures {
	acceptsUrlIdentifier: boolean | UrlSourceIdentifierMatch;
	acceptsIdIdentifier: boolean | IdSourceIdentifierMatch;

	maxItemLimiting?: boolean;
	itemOrdering?: DropdownOption[];
}

export interface PlaylistExtractor extends PluginModuleInfo {
	features: PlaylistExtractorFeatures;
}

// const test = {
// 	acceptsIdIdentifier: true,
// 	acceptsUrlIdentifier: /test/,

// 	maxItemLimiting: false,
// 	itemOrdering: [
// 		{
// 			displayName: 'he',
// 			value: 'he',
// 		},
// 		{
// 			displayName: 'NO',
// 			value: 'no',
// 		},
// 	] as const,
// } satisfies PlaylistExtractorFeatures;

// const p: PlaylistExtractorProps<typeof test> = {};