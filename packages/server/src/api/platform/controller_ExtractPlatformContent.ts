import { isError, newError } from 'exitus';
import { type RequestHandler } from 'express';
import { rm } from 'fs/promises';
import { type Guard } from 'is-guard';
import { config, logger } from '~/index.js';
import {
	ContentItemExtractionCallback,
	ExtractedContent,
	isContentExtractorType,
	usePluginModule,
	type ContentExtractor,
	type ContentExtractorParameters,
	type ContentExtractorType,
	type PlatformContentExtractor,
	type PlatformManager,
} from '~/plugins/index.js';
import { sequentialAsync } from '~/utils/async/sequential-async.js';
import { importExtractedContent } from '../../services/platform/import-extracted-content.js';

export interface Params {
	platformName: string;
}

export interface Body {
	contentSource: unknown;
	extractorOptions?: unknown;
	contentExtractorType: ContentExtractorType;
}
/**
 * Extracts content for an existing platform, using the platform's assigned media and metadata extractors.
 */
export const ExtractPlatformContentController: RequestHandler<Params, any, Body> = (req, res) => {
	const { contentExtractorType, contentSource, extractorOptions } = req.body;
	if (!isContentExtractorType(contentExtractorType)) {
		newError({
			message: 'Invalid content extractor type provided in request body.',
			context: {
				type: contentExtractorType,
			},
			log: 'warn',
		});
		return res.status(400).end();
	}

	let mediaExtractor: PlatformContentExtractor | null = null;
	if (req.forwarded.platform!.mediaExtractor) {
		mediaExtractor = usePluginModule<PlatformContentExtractor>(
			req.forwarded.platform!.mediaExtractor,
		);
	} else {
		const moduleReference = req.forwarded.platform!.platformManager!;
		const module = usePluginModule<PlatformManager>(moduleReference);

		const errorContext = {
			pluginModule: moduleReference,
			platform: req.forwarded.platform!.name,
		} as Record<string, unknown>;

		if (
			module === null ||
			module.kind !== 'platform-manager' ||
			module.contentExtractor === null ||
			!(
				contentExtractorType in
				(module.contentExtractor as PlatformContentExtractor).extractors
			)
		) {
			let errorMessage: string = '';
			if (module === null) {
				errorMessage =
					'Attempt to use plugin module to download platform media failed. The plugin module is not loaded into the program.';
			} else if (module.kind !== 'platform-manager') {
				errorMessage =
					'Platform is misconfigured, as it references an incompatible platform management plugin module.';
				errorContext.pluginModuleKind = module.kind;
			} else if (module.contentExtractor === null) {
				errorMessage =
					'PlatformManager plugin module does not reference a media extractor module.';
			} else {
				errorMessage =
					'PlatformMediaExtractor plugin module does not support the provided content extractor type.';
				errorContext.providedExtractorType = contentExtractorType;
			}

			newError({
				message: errorMessage,
				context: errorContext,
				log: 'error',
			});
			return res.status(500).end();
		}

		mediaExtractor = module.contentExtractor as PlatformContentExtractor;
	}

	if (!mediaExtractor || mediaExtractor.kind !== 'platform-content-extractor') {
		newError({
			message:
				'PlatformMediaExtractor not found or referenced module is not of the correct kind.',
			log: 'error',
		});
		return res.status(500).end();
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const { extractor, validation } = mediaExtractor.extractors[
		contentExtractorType
	] as unknown as {
		extractor: ContentExtractor<ContentExtractorType>;
		validation: Guard<any>;
	};

	let areParamsValid: boolean = false;
	if (contentExtractorType === 'many-to-many') {
		if (Array.isArray(contentSource)) {
			areParamsValid = contentSource.every(validation);
		} else {
			areParamsValid = false;
		}
	} else {
		areParamsValid = validation(contentSource);
	}

	if (!areParamsValid) {
		newError({
			message: 'Invalid params provided for PlatformMediaExtractor call',
			context: { params: contentSource },
			log: 'error',
		});
		return res.status(400).end();
	}

	const params = Array.isArray(contentSource)
		? contentSource.map(
				(source) =>
					({
						mode: 'content+metadata',
						queuedByUserId: req.forwarded.user!.id,
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						source: source,
					}) as ContentExtractorParameters<any>,
			)
		: ({
				mode: 'content+metadata',
				queuedByUserId: req.forwarded.user!.id,
				source: contentSource,
			} as ContentExtractorParameters<any>);

	const context = {
		pluginName: mediaExtractor.pluginName,
		userId: req.forwarded.user!.id,
	};

	const promises: Promise<number | void>[] = [];

	const importCallback = async (content: ExtractedContent) =>
		importExtractedContent({
			...content,
			source: {
				...content.source,
				platformId: content.source.platformId ?? req.forwarded.platform!.id,
			},
		}).catch((err) => {
			if (isError(err)) {
				if (err.debug?.logged) {
					return;
				}
				logger.error(err);
			} else {
				newError({
					message: 'Unexpected error importing extracted content.',
					caughtException: err,
					log: 'error',
					context: {
						files: content.files,
						queuedByUserId: content.queuedByUserId,
					},
				});
			}
		});
	const onContentItemExtracted: ContentItemExtractionCallback = (content, cleanup) => {
		logger.info({
			message: 'onContentItemExtracted',
			context: {
				content,
			},
		});
		let p = importCallback(content);
		if (cleanup && cleanup.files) {
			p = p
				.then(() =>
					Promise.all(
						cleanup.files!.map((filePath) => {
							if (!filePath.startsWith(config.libraryDir)) {
								return Promise.reject('Path is not under the library dir!');
							}
							return rm(filePath, {
								force: false,
							});
						}),
					),
				)
				.catch((err) =>
					newError({
						log: 'error',
						message: 'Content item extraction post-import cleanup failed.',
						context: {
							files: cleanup.files,
						},
						caughtException: err,
					}),
				)
				.then(() => {});
		}
		promises.push(p);
	};
	const onContentItemExtractionFailed: ContentItemExtractionCallback = () => {};

	return extractor(params as any, extractorOptions as any, context, {
		onContentItemExtracted,
		onContentItemExtractionFailed,
	})
		.then((resultOrUndefined) => {
			const promiseCount = promises.length;
			if (typeof resultOrUndefined === 'undefined' || promiseCount !== 0) {
				logger.info({
					message: 'Content extraction complete',
					context: {
						extractionParams: params,
					},
				});
				if (promiseCount !== 0 && typeof resultOrUndefined !== 'undefined') {
					newError({
						message:
							'Content extractor has used callbacks, but has still returned a result that is not undefined. Ignoring the returned result.',
						log: 'warn',
						context: {
							numberOfPromisesCreated: promises.length,
						},
					});
				}
				return Promise.all(promises);
			}

			const extractedContent = Array.isArray(resultOrUndefined)
				? resultOrUndefined
				: 'extracted' in resultOrUndefined
					? resultOrUndefined.extracted
					: [resultOrUndefined];

			return sequentialAsync(importCallback, extractedContent, true);
		})
		.then((results) => {
			const successes = results.filter((v): v is number => typeof v === 'number');

			logger.info({
				message: `Successfully extracted and imported ${successes.length} items.`,
				context: {
					mediaIds: successes.join(', '),
				},
			});

			return res.status(200).json({
				newMediaIds: successes,
			});
		});
};
