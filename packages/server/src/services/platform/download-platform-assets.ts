import { writeFile } from 'fs/promises';
import path from 'path';
import { errorOutcome, mkdirDefaults } from '~/exports.js';
import { logger } from '~/index.js';
import { type PlatformDownloadableAssets } from '~/plugins/index.js';
import { isUrl } from '~/utils/strings/format-urls.js';

export interface DownloadPlatformAssetsProps {
	assetsSourceMap: PlatformDownloadableAssets;
	outDir: string;
}

export interface DownloadedPlatformAsset {
	key: string;
	filename: string;
	url?: string;
}

/**
 *
 * @returns An array containing all the file details for assets that were successfully downloaded
 */
export const downloadPlatformAssets = async ({
	outDir,
	assetsSourceMap,
}: DownloadPlatformAssetsProps): Promise<DownloadedPlatformAsset[]> =>{
	await mkdirDefaults(outDir);

	return await Promise.all(
		Object.entries(assetsSourceMap).map(async ([key, url]) => {
			if (!url) {
				return null;
			}

			const context = { assetUrl: url, assetKey: key };

			if (!isUrl(url)) {
				errorOutcome(
					{
						message:
							'A non-nullish url value was provided, but failed to be parsed as a URL.',
						context,
					},
					logger.warn,
				);
				return null;
			}

			const cleanUrl = url.split('?')[0];
			if (!cleanUrl) {
				errorOutcome(
					{
						message:
							'A URL with a query was provided, which is not supported in the current implementation.',
						context,
					},
					logger.warn,
				);
				return null;
			}

			const filename = `${key}${path.extname(cleanUrl)}`;

			return fetch(cleanUrl)
				.then((res) => res.blob())
				.then((blob) =>
					blob
						.arrayBuffer()
						.then((buffer) =>
							writeFile(
								path.join(outDir, filename),
								Buffer.from(buffer),
							),
						),
				)
				.then(() => ({
					filename,
					url,
					key,
				}))
				.catch((err) => {
					errorOutcome(
						{
							message:
								'Failed to download asset using provided URL.',
							context,
							caughtException: err,
						},
						logger.error,
					);
					return null;
				});
		}),
	).then((result) => result.filter(<T>(v: T | null): v is T => v !== null));
}
