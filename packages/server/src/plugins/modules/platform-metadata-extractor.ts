import {
	type PlatformCommunityMetadataExtractor,
	type PlatformProfileMetadataExtractor,
} from './shared/functions.js';
import {
	type MappedPluginModule,
	type PluginModule,
	type PluginModuleConfig,
	type PluginModuleHandler,
} from './shared/index.js';

export interface PlatformMetadataExtractorConfig
	extends PluginModuleConfig<'platform-metadata-extractor'> {
	extractors: {
		communityMetadata?: PlatformCommunityMetadataExtractor;
		profileMetadata?: PlatformProfileMetadataExtractor;
	};
}

export type PlatformMetadataExtractor<
	Config extends
		PlatformMetadataExtractorConfig = PlatformMetadataExtractorConfig,
> = PluginModule<'platform-metadata-extractor'> & {
	extractors: {
		[K in keyof Required<
			PlatformMetadataExtractorConfig['extractors']
		>]: Config['extractors'][K] extends (...args: unknown[]) => unknown
			? Config['extractors'][K]
			: null;
	};
};

export const loadPlatformMetadataExtractor: PluginModuleHandler<
	'platform-metadata-extractor'
> = async (moduleConfig) =>
	Promise.resolve({
		linkModuleReferences: null,
		loadedProps: {
			extractors: {
				communityMetadata:
					moduleConfig.extractors.communityMetadata ?? null,
				profileMetadata:
					moduleConfig.extractors.profileMetadata ?? null,
			},
		} as Omit<
			MappedPluginModule<'platform-metadata-extractor'>,
			keyof PluginModule<'platform-metadata-extractor'>
		>,
	});
