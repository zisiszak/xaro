import { addPlatformProfileIfNotExists } from '~/data/access/platform-profile.js';
import { getPlatformDirs } from '~/data/access/platform.js';
import { errorOutcome, isErrorOutcome } from '~/exports.js';
import { logger } from '~/index.js';
import { downloadPlatformAssets } from './download-platform-assets.js';
import { extractPlatformProfileMetadata } from './extract-metadata.js';

export async function extractAndAddPlatformProfileIfNotExists({
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
	return addPlatformProfileIfNotExists(
		{ displayName, linkedPlatformId, sourceId, name },
		async () =>
			extractPlatformProfileMetadata({
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
							.then(({ assets: { profile } }) =>
								downloadPlatformAssets({
									outDir: profile,
									assetsSourceMap: data.downloadableAssets!,
								}),
							)
							.then((results) => {
								results.forEach((result) => {
									assets[result.key] = result.filename;
								});
							})
							.catch((err) => {
								if (isErrorOutcome(err)) {
									return;
								}
								logger.error(
									errorOutcome({
										message:
											'Unexpected error downloading platform assets',
										caughtException: err,
										context: {
											platformProfileSourceId:
												data.sourceId,
											downloadableAssets:
												data.downloadableAssets,
											platformId: linkedPlatformId,
										},
									}),
								);
							});
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
