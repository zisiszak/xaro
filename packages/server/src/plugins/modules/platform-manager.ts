import { addPlatformProfileIfNotExists } from '~/data/access/platform-profile.js';
import { defaultPlatformProfileInsertion } from '~/data/model/shared/default-items.js';
import { type Platform } from '~/exports.js';
import { db } from '~/index.js';
import { type PluginModuleReference } from '../index.js';
import {
	createExtractedIdsFile,
	type ExtractedIdsFile,
} from '../utils/extracted-ids-file.js';
import {
	createLinkReferencesCallback,
	type PluginModule,
	type PluginModuleConfig,
	type PluginModuleHandler,
} from './shared/index.js';

export interface PlatformManagerConfig
	extends PluginModuleConfig<'platform-manager'> {
	platformItem: Platform.Insertion;

	createDefaultItems?: {
		platformProfile?: boolean;
	};

	useExtractedIdsFile?: boolean;

	contentExtractor?: PluginModuleReference;
	metadataExtractor?: PluginModuleReference;
}

export type PlatformManager<
	Config extends PlatformManagerConfig = PlatformManagerConfig,
> = PluginModule<'platform-manager'> & {
	platformId: number;
	platformName: string;

	defaultItems: Required<{
		[K in keyof NonNullable<
			NonNullable<PlatformManagerConfig['createDefaultItems']>
		> as `${K}Id`]: Config['createDefaultItems'] extends object
			? Config['createDefaultItems'][K] extends true
				? number
				: null
			: null;
	}>;

	extractedIdsFile: Config['useExtractedIdsFile'] extends true
		? ExtractedIdsFile
		: null;

	contentExtractor: Config['contentExtractor'] extends string
		? PluginModule<'platform-content-extractor'>
		: null;
	metadataExtractor: Config['metadataExtractor'] extends string
		? PluginModule<'platform-metadata-extractor'>
		: null;
};

export const loadPlatformManager: PluginModuleHandler<
	'platform-manager'
> = async (moduleConfig, { pluginName }) => {
	const {
		platformItem,
		name,
		createDefaultItems,
		contentExtractor,
		metadataExtractor,
		useExtractedIdsFile,
	} = moduleConfig;
	const platformId = await db
		.selectFrom('Platform')
		.select('id')
		.where('name', '=', platformItem.name)
		.executeTakeFirstOrThrow()
		.then(({ id }) => id)
		.catch(() =>
			db
				.insertInto('Platform')
				.values({
					displayName: platformItem.displayName,
					name: platformItem.name,
					platformManager: `${pluginName}.${name}`,
					description: platformItem.description,
					urlRegExp: platformItem.urlRegExp,
					homeUrl: platformItem.homeUrl,
				})
				.executeTakeFirstOrThrow()
				.then(({ insertId }) => Number(insertId)),
		);

	let defaultPlatformProfileId: null | number = null;
	if (createDefaultItems?.platformProfile) {
		defaultPlatformProfileId = await addPlatformProfileIfNotExists({
			...defaultPlatformProfileInsertion,
			linkedPlatformId: platformId,
		});
	}

	let extractedIdsFile: ExtractedIdsFile | null = null;
	if (useExtractedIdsFile) {
		extractedIdsFile = await createExtractedIdsFile(platformItem.name);
	}

	const result = {
		platformId: platformId,
		platformName: platformItem.name,
		defaultItems: {
			platformProfileId: defaultPlatformProfileId,
		},
		extractedIdsFile,
		contentExtractor: null,
		metadataExtractor: null,
	} as Awaited<
		ReturnType<PluginModuleHandler<'platform-manager'>>
	>['loadedProps'];

	const linkModuleReferences = createLinkReferencesCallback<
		'platform-manager',
		'contentExtractor' | 'metadataExtractor'
	>({
		contentExtractor: contentExtractor
			? {
					kind: 'platform-content-extractor',
					reference: contentExtractor,
				}
			: null,
		metadataExtractor: metadataExtractor
			? {
					kind: 'platform-metadata-extractor',
					reference: metadataExtractor,
				}
			: null,
	});

	return {
		loadedProps: result,
		linkModuleReferences: linkModuleReferences,
	};
};
