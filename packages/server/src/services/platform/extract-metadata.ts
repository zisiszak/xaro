import { newError } from 'exitus';
import {
	usePluginModule,
	type ExtractedPlatformCommunityMetadata,
	type ExtractedPlatformProfileMetadata,
	type PlatformCommunityMetadataExtractor,
	type PlatformManager,
	type PlatformMetadataExtractor,
	type PlatformProfileMetadataExtractor,
} from '~/exports.js';
import { db } from '~/index.js';

const extractPlatformAssociatedMetadataFactory = <Kind extends 'community' | 'profile'>(
	kind: Kind,
) => {
	const extractorName = kind === 'community' ? 'communityMetadata' : 'profileMetadata';
	return async ({
		platformOrPlatformId,
		sourceId,
	}: {
		platformOrPlatformId: string | number;
		sourceId: string;
	}): Promise<
		| null
		| (Kind extends 'community'
				? ExtractedPlatformCommunityMetadata
				: ExtractedPlatformProfileMetadata)
	> =>
		db
			.selectFrom('Platform')
			.select(['id', 'platformManager', 'metadataExtractor'])
			.where(
				typeof platformOrPlatformId === 'number' ? 'id' : 'name',
				'=',
				platformOrPlatformId,
			)
			.executeTakeFirstOrThrow()
			.then(({ platformManager, metadataExtractor }) => {
				let module: PlatformMetadataExtractor | null = null;

				let managerPluginName: string | undefined;
				const context = {
					pluginModule: platformManager,
					metadataExtractor,
					platform: platformOrPlatformId,
					profileId: sourceId,
				};

				if (metadataExtractor) {
					module = usePluginModule<PlatformMetadataExtractor>(metadataExtractor);
				} else if (platformManager) {
					const manager = usePluginModule<PlatformManager>(platformManager);
					if (
						manager === null ||
						manager.kind !== 'platform-manager' ||
						manager.metadataExtractor === null
					) {
						newError({
							log: 'warn',
							message:
								'PlatformManager did not include a valid PlatformMetadataExtractor module reference.',
							context,
						});
					} else {
						module = manager.metadataExtractor as PlatformMetadataExtractor;
						managerPluginName = manager.pluginName;
					}
				}

				if (
					module === null ||
					(module as PlatformMetadataExtractor).extractors[extractorName] === null
				) {
					newError({
						log: 'error',
						message:
							module === null
								? 'No PlatformMetadataExtractor found that is linked to the platform.'
								: 'No extractor found for the associated extractor key.',
						context: {
							...context,
							extractorKey: extractorName,
						},
					});
					return null;
				}

				const extractor = module.extractors[
					extractorName
				] as unknown as Kind extends 'community'
					? PlatformCommunityMetadataExtractor
					: PlatformProfileMetadataExtractor;

				return extractor(sourceId, {
					plugin: managerPluginName,
				}) as Promise<
					null | Kind extends 'community'
						? ExtractedPlatformCommunityMetadata
						: ExtractedPlatformProfileMetadata
				>;
			});
};

export const extractPlatformProfileMetadata = extractPlatformAssociatedMetadataFactory('profile');

export const extractPlatformCommunityMetadata =
	extractPlatformAssociatedMetadataFactory('community');
