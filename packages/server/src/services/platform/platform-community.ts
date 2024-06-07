import { newError } from 'exitus';
import { addPlatformCommunityIfNotExists } from '~/data/access/platform-community.js';
import { getPlatformDirs } from '~/data/access/platform.js';
import { downloadPlatformAssets } from './download-platform-assets.js';
import { extractPlatformCommunityMetadata } from './extract-metadata.js';

/**
 * Literally just a copy paste using `extractAndAddPlatformProfileIfNotExists`
 */
export async function extractAndAddPlatformCommunityIfNotExists({
	displayName,
	linkedPlatformId,
	sourceId,
	name,
}: {
	displayName: string;
	linkedPlatformId: number;
	sourceId: string;
	name: string;
}): Promise<number> {
	return addPlatformCommunityIfNotExists(
		{ displayName, linkedPlatformId, sourceId, name },
		async () =>
			extractPlatformCommunityMetadata({
				sourceId: sourceId,
				platformOrPlatformId: linkedPlatformId,
			})
				.then(async (data) => {
					if (!data) {
						return null;
					}

					const assets: Record<string, string> = {};
					if (
						data.downloadableAssets &&
						Object.keys(data.downloadableAssets).length !== 0
					) {
						await getPlatformDirs(linkedPlatformId)
							.then(({ assets: { community } }) =>
								downloadPlatformAssets({
									outDir: community,
									assetsSourceMap: data.downloadableAssets!,
								}),
							)
							.then((results) => {
								results.forEach((result) => {
									assets[result.key] = result.filename;
								});
							})
							.catch((err) =>
								newError({
									message: 'Unexpected error downloading platform assets',
									caughtException: err,
									context: {
										platformCommunitySourceId: data.sourceId,
										downloadableAssets: data.downloadableAssets,
										platformId: linkedPlatformId,
									},
									log: 'error',
								}),
							);
					}

					return { ...data, assets };
				})

				.then((data) =>
					data
						? {
								displayName: data.displayName,
								sourceId: data.sourceId,
								sourceUrl: data.sourceUrl,
								description: data.description ?? undefined,
								name: data.name,
								assets: data.assets,
								subscribers: data.subscribers ?? undefined,
								dateCreated: data.dateCreated ?? undefined,
							}
						: null,
				),
	);
}
