import { isError, newError } from 'exitus';
import { URL } from 'url';
import { getPlatformDirs } from '~/data/access/platform.js';
import { db, logger } from '~/index.js';
import { getPluginModulesByKind } from '~/plugins/loader.js';
import {
	GenericPlatformsManager,
	PlatformDetailsExtractor,
} from '~/plugins/modules/generic-platforms-manager.js';
import { isUrl, urlToRegExp } from '~/utils/strings/format-urls.js';
import { downloadPlatformAssets } from './download-platform-assets.js';

export const findMatchingGenericPlatformManager = (
	inputUrl: string,
): null | {
	pluginModule: GenericPlatformsManager;
	compatibilityResult: true | string;
} => {
	const genericPlatformManagers = getPluginModulesByKind('generic-platforms-manager');
	if (genericPlatformManagers.length === 0) {
		newError({
			message:
				'No generic platform managers were found when trying to resolve unidentified platform from url.',
			context: {
				inputUrl,
			},
			log: 'error',
		});
		return null;
	}

	genericPlatformManagers.sort((a, b) => {
		if (a.priority > b.priority) {
			return 1;
		}
		if (a.priority < b.priority) {
			return -1;
		}
		return 0;
	});

	let compatibilityResult: boolean | string = false;
	const matchingManager = genericPlatformManagers.find((manager) => {
		const test = manager.urlCompatibilityTest(inputUrl);
		if (test === false) {
			return false;
		}
		compatibilityResult = test;
		return true;
	});

	if (compatibilityResult === false || !matchingManager) {
		return null;
	}

	return {
		compatibilityResult: compatibilityResult,
		pluginModule: matchingManager,
	};
};

export interface AddUnidentifiedPlatformProps {
	inputUrl: string;
	userId: number;
}
/**
 * only used when a platform has not been added to the database already, and requires some form of resolution attempt.
 *
 */
export async function addUnidentifiedPlatform({
	inputUrl,
}: AddUnidentifiedPlatformProps): Promise<undefined | number> {
	const manager = findMatchingGenericPlatformManager(inputUrl);
	if (!manager) {
		logger.info({
			message: 'No compatible GenericPlatformsManager plugin module found.',
			context: {
				inputUrl,
			},
		});
		return undefined;
	}

	const extractor = manager.pluginModule.extractors
		.platformDetails as null | PlatformDetailsExtractor<any>;
	const genericPlatformsManager =
		`${manager.pluginModule.pluginName}.${manager.pluginModule.name}` as const;
	const context = {
		inputUrl,
		genericManagerModule: genericPlatformsManager,
	};
	if (!extractor) {
		newError({
			message:
				'GenericPlatformsManager plugin module was found, but included no means of getting platform details.',
			context: context,
			log: 'error',
		});
		return undefined;
	}

	const extractedPlatformDetails = await extractor(
		{
			compatibilityResult: manager.compatibilityResult,
			inputValue: inputUrl,
		},
		{},
	).catch((err) => {
		if (!isError(err)) {
			newError({
				message: 'Unhandled exception.',
				context: context,
				log: 'error',
			});
		}
		return null;
	});
	if (!extractedPlatformDetails) {
		return undefined;
	}

	const {
		name,
		homeUrl,
		displayName,
		description,
		matchExpression,
		mediaExtractorPluginModule,
		metadataExtractorPluginModule,
		downloadableAssets,
	} = extractedPlatformDetails;

	if (!isUrl(homeUrl)) {
		newError({
			message: 'Invalid "homeUrl" value provided by GenericPlatformsManager module.',
			log: 'error',
			context: { ...context, homeUrl },
		});
		return undefined;
	}

	const assets: Record<string, string> = {};
	if (downloadableAssets && Object.keys(downloadableAssets).length !== 0) {
		await getPlatformDirs(name).then(({ assets: { platform } }) =>
			downloadPlatformAssets({
				outDir: platform,
				assetsSourceMap: downloadableAssets,
			})
				.then((results) => {
					results.forEach((result) => {
						assets[result.key] = result.filename;
					});
				})
				.catch((err) => {
					if (isError(err)) {
						return;
					}
					newError({
						message: 'Unexpected error downloading platform assets.',
						caughtException: err,
						log: 'error',
						context: {
							...context,
							downloadableAssets,
							platform: name,
						},
					});
				}),
		);
	}

	return db
		.insertInto('Platform')
		.values({
			description,
			displayName,
			urlRegExp: (matchExpression ?? urlToRegExp(new URL(homeUrl))).source,
			homeUrl,
			name,
			genericPlatformsManager: genericPlatformsManager,
			mediaExtractor: mediaExtractorPluginModule,
			metadataExtractor: metadataExtractorPluginModule,
		})
		.executeTakeFirstOrThrow()
		.then(async ({ insertId }) => Number(insertId))
		.catch((err) => {
			newError({
				message: 'Failed to insert resolved unidentified platform into database.',
				context: { ...context, platform: name },
				caughtException: err,
				log: 'error',
			});
			return undefined;
		});
}
