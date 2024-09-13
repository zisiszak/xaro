import { logger } from '~/index.js';
import {
	idSourceIdentifierMatchAsFunction,
	urlSourceIdentifierMatchAsFunction,
	type IdSourceIdentifier,
	type IdSourceIdentifierMatch,
	type IdSourceIdentifierMatchingFunction,
	type LoadedPluginModuleInfo,
	type PluginModuleInfo,
	type PluginModuleLoaderFunction,
	type UrlSourceIdentifier,
	type UrlSourceIdentifierMatch,
	type UrlSourceIdentifierMatchingFunction,
} from './shared.js';

export interface BasicExtractorFunctionProps<F extends BasicExtractorFeatures> {
	identifier:
		| (F['acceptsIdIdentifier'] extends true | IdSourceIdentifierMatch
				? IdSourceIdentifier
				: never)
		| (F['acceptsUrlIdentifier'] extends true | UrlSourceIdentifierMatch
				? UrlSourceIdentifier
				: never);
}

export type BasicExtractorFunction<F extends BasicExtractorFeatures> = (
	props: BasicExtractorFunctionProps<F>,
) => Promise<unknown>;

export interface BasicExtractorFeatures {
	acceptsUrlIdentifier: boolean | UrlSourceIdentifierMatch;
	acceptsIdIdentifier: boolean | IdSourceIdentifierMatch;
}

export interface BasicExtractor<F extends BasicExtractorFeatures>
	extends PluginModuleInfo<'basic-extractor'> {
	features: F;
	generic?: boolean;
	extractor: BasicExtractorFunction<F>;
}
export type LoadedBasicExtractor = {
	generic: boolean;
	features: {
		acceptsUrlIdentifier: UrlSourceIdentifierMatchingFunction | false;
		acceptsIdIdentifier: IdSourceIdentifierMatchingFunction | false;
	};
	extractor: BasicExtractorFunction<any>;
} & LoadedPluginModuleInfo<'basic-extractor'>;

export const loadBasicExtractor: PluginModuleLoaderFunction<
	BasicExtractor<BasicExtractorFeatures>
> = (module, baseInfo) => {
	if (typeof module.extractor !== 'function') {
		logger.error(
			{ pluginModuleID: baseInfo.id },
			'BasicExtractor extractor is not a function.',
		);
		throw null;
	}

	const acceptsUrlIdentifier =
		module.features.acceptsUrlIdentifier === false
			? false
			: urlSourceIdentifierMatchAsFunction(module.features.acceptsUrlIdentifier);
	const acceptsIdIdentifier =
		module.features.acceptsIdIdentifier === false
			? false
			: idSourceIdentifierMatchAsFunction(module.features.acceptsIdIdentifier);

	if (acceptsIdIdentifier === false && acceptsUrlIdentifier === false) {
		logger.error(
			{ pluginModuleID: baseInfo.id },
			'BasicExtractor must accept at least one source identifier.',
		);
		throw null;
	}

	return {
		...baseInfo,
		generic: module.generic === true,
		features: {
			acceptsIdIdentifier,
			acceptsUrlIdentifier,
		},
		extractor: module.extractor,
	};
};
