import { type Guard } from 'is-guard';
import { type InputFieldsConfiguration } from '../../client/models/input-fields.js';
import { type ContentExtractor } from './shared/functions.js';
import {
	type MappedPluginModule,
	type PluginModule,
	type PluginModuleConfig,
	type PluginModuleHandler,
} from './shared/index.js';

export interface PlatformContentExtractorConfig
	extends PluginModuleConfig<'platform-content-extractor'> {
	extractors: {
		'one-to-one'?: {
			extractor: ContentExtractor<'one-to-one'>;
			validation: Guard<any>;
			fields: InputFieldsConfiguration;
		};
		'many-to-many'?: {
			extractor: ContentExtractor<'many-to-many'>;
			validation: Guard<any>;
			fields: InputFieldsConfiguration;
		};

		'one-to-many'?: {
			extractor: ContentExtractor<'one-to-many'>;
			validation: Guard<any>;
			fields: InputFieldsConfiguration;
		};
	};
}

export type PlatformContentExtractor<
	Config extends
		PlatformContentExtractorConfig = PlatformContentExtractorConfig,
> = PluginModule<'platform-content-extractor'> & {
	extractors: {
		[K in keyof Required<
			PlatformContentExtractorConfig['extractors']
		>]: Config['extractors'][K] extends object
			? Config['extractors'][K]
			: null;
	};
};

export const loadPlatformContentExtractor: PluginModuleHandler<
	'platform-content-extractor'
> = async (moduleConfig) =>
	Promise.resolve({
		linkModuleReferences: null,
		loadedProps: {
			extractors: {
				'one-to-one': moduleConfig.extractors['one-to-one'] ?? null,
				'many-to-many': moduleConfig.extractors['many-to-many'] ?? null,
				'one-to-many': moduleConfig.extractors['one-to-many'] ?? null,
			},
		} as Omit<
			MappedPluginModule<'platform-content-extractor'>,
			keyof PluginModule<'platform-content-extractor'>
		>,
	});
