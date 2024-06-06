import {
	ExtractedIdsFile,
	createGenericExtractedIdsFile,
} from '../utils/index.js';
import {
	PlatformDownloadableAssets,
	PlatformExistingAssets,
	PluginCallContext,
	PluginModule,
	PluginModuleConfig,
	PluginModuleHandler,
	PluginModuleReference,
} from './shared/index.js';

export type UrlCompatibilityResult = string | boolean;

/** If this returns false, then the compatibility check fails. If it returns a string or true, the url is considered compatible. */
export type UrlCompatibilityFunction<
	CompatiblityResult extends UrlCompatibilityResult,
> = (value: string) => CompatiblityResult;

export interface ExtractedPlatformDetails {
	// these three properties should (ideally) always return the exact same three values for any number of urls that resolve to the same platform. Otherwise, a new platform will be added if it doesn't exist, even if the intended resolved platform is already in the database, which likely isn't desired behaviour.
	name: string;
	primaryUrlBasename: string;
	homeUrl: string;

	displayName: string;
	description?: string | null;

	/** If undefined, the `homeUrl` will be converted and used instead. This allows for additional control, such as including multiple known associated domains. */
	matchExpression?: RegExp;

	/** In order of recommendation */
	mediaExtractorPluginModule?: PluginModuleReference | null;
	/** In order of recommendation */
	metadataExtractorPluginModule?: PluginModuleReference | null;

	downloadableAssets?: PlatformDownloadableAssets | null;
	existingAssets?: PlatformExistingAssets | null;
}

export type PlatformDetailsPresets<Url extends string> = {
	[key in Url]?: PluginModuleReference;
};

export interface PlatformDetailsExtractorParameters<
	CompatibilityResult extends UrlCompatibilityResult,
> {
	inputValue: string;
	compatibilityResult: CompatibilityResult extends boolean
		? true
		: CompatibilityResult;
}
export type PlatformDetailsExtractor<
	CompatibilityResult extends UrlCompatibilityResult,
> = (
	PlatformDetailsExtractorParameters: PlatformDetailsExtractorParameters<CompatibilityResult>,
	context: PluginCallContext,
) => Promise<ExtractedPlatformDetails | null>;

export interface GenericPlatformsManagerConfig
	extends PluginModuleConfig<'generic-platforms-manager'> {
	/**
	 * A higher priority results in the `GenericPlatformsManager` to be tested for compatibility before other `GenericPlatformManagers` with lower priorities. 0 implies that the platform manager will attempt to match for any URL.
	 */
	priority: number;

	urlCompatibilityTest: UrlCompatibilityFunction<UrlCompatibilityResult>;

	useExtractedIdsFile?: boolean;

	extractors?: {
		platformDetails: PlatformDetailsExtractor<any>;
	};

	/** If the `urlCompatibilityTest` provided returns a string and a preset with a matching key is defined, the `ExtractedPlatformDetails` defined on that property will be used instead of using the extractor. */
	presets?: PlatformDetailsPresets<any>;
}

export type GenericPlatformsManager<
	Config extends
		GenericPlatformsManagerConfig = GenericPlatformsManagerConfig,
> = PluginModule<'generic-platforms-manager'> & {
	priority: number;

	urlCompatibilityTest: UrlCompatibilityFunction<
		ReturnType<Config['urlCompatibilityTest']>
	>;

	extractors: {
		[K in keyof NonNullable<
			GenericPlatformsManagerConfig['extractors']
		>]: Config['extractors'] extends object
			? Config['extractors'][K]
			: null;
	};

	extractedIdsFile: Config['useExtractedIdsFile'] extends true
		? ExtractedIdsFile
		: null;

	presets: Config['presets'] extends PlatformDetailsPresets<infer K>
		? PlatformDetailsPresets<K>
		: PlatformDetailsPresets<string>;
};

export const loadGenericPlatformsManager: PluginModuleHandler<
	'generic-platforms-manager'
> = async (moduleConfig, { pluginName }) => {
	const {
		useExtractedIdsFile,
		priority,
		urlCompatibilityTest,
		extractors,
		presets,
	} = moduleConfig;

	let extractedIdsFile: ExtractedIdsFile | null = null;
	if (useExtractedIdsFile) {
		extractedIdsFile = await createGenericExtractedIdsFile(
			`${pluginName}.${moduleConfig.name}`,
		);
	}

	return Promise.resolve({
		linkModuleReferences: null,
		loadedProps: {
			extractors: {
				platformDetails: extractors ? extractors.platformDetails : null,
			} as any,
			presets: presets ?? {},
			priority: Math.max(0, priority),
			urlCompatibilityTest,
			extractedIdsFile: extractedIdsFile as null,
		},
	});
};
