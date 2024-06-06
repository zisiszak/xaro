/* eslint-disable @typescript-eslint/ban-types */

import { type Guard } from 'is-guard';

export interface PluginCallContext {
	plugin?: string;
	userId?: number;
}

export interface PlatformDownloadableAssets {
	[key: string]: string | null | undefined;
}
export interface PlatformExistingAssets {
	[key: string]: string;
}

export const extractedContentFileKinds = [
	'thumbnail',
	'main',
	'metadata',
	'description',
	'subtitles',
	'other',
	'preview',
] as const;
export type ExtractedFileKind = (typeof extractedContentFileKinds)[number];
export const isExtractedFileKind: Guard<ExtractedFileKind> = (
	v: unknown,
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
): v is ExtractedFileKind => extractedContentFileKinds.includes(v as any);

const contentExtractorTypes = [
	'one-to-one',
	'one-to-many',
	'many-to-many',
] as const;
export type ContentExtractorType = (typeof contentExtractorTypes)[number];
export const isContentExtractorType: Guard<ContentExtractorType> = (
	v: unknown,
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
): v is ContentExtractorType => contentExtractorTypes.includes(v as any);

const contentExtractorModes = [
	'content',
	'metadata',
	'content+metadata',
] as const;
export type ContentExtractorMode = (typeof contentExtractorModes)[number];
export const isContentExtractorMode: Guard<ContentExtractorMode> = (
	v: unknown,
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
): v is ContentExtractorMode => contentExtractorModes.includes(v as any);

export interface ExtractedPlatformProfileMetadata {
	platform: string;

	sourceId: string;
	sourceUrl: string;
	displayName: string;
	name: string;
	description?: string | null;
	subscribers?: number | null;
	dateCreated?: string | null;

	downloadableAssets?: PlatformDownloadableAssets;

	rawJSON?: string;
}
export type PlatformProfileMetadataExtractor = (
	input: string,
	context: PluginCallContext,
) => Promise<ExtractedPlatformProfileMetadata | null>;

export interface ExtractedPlatformCommunityMetadata {
	platform: string;

	sourceId: string;
	sourceUrl: string;
	displayName: string;
	name: string;
	description?: string | null;
	subscribers?: number | null;
	subtitle?: string | null;
	dateCreated?: string | null;

	downloadableAssets?: PlatformDownloadableAssets;

	rawJSON?: string;
}
export type PlatformCommunityMetadataExtractor = (
	input: string,
	context: PluginCallContext,
) => Promise<ExtractedPlatformCommunityMetadata | null>;

interface ExtractedFile<Kind extends ExtractedFileKind> {
	kind: Kind;
	sourceUrl?: string;
	filePath: string;
}
export interface ExtractedContentSourceInfo {
	platformId?: number;
	platform?: string;

	sourceId: string;
	sourceUrl: string;
	pageUrl?: string;

	platformProfileName?: string | null;
	platformCommunityName?: string | null;
}

export interface ExtractedPlatformContentMetadata {
	title?: string | null;
	description?: string | null;

	bodyText?: string | null;

	ageLimit?: number | null;

	viewCount?: number | null;
	commentCount?: number | null;
	likeCount?: number | null;
	likeToDislikeRatio?: number | null;

	categories?: string[] | null;
	tags?: string[] | null;
	genres?: string[] | null;

	datePublished?: Date | string | null;
	dateModified?: Date | string | null;

	rawJSON?: string;
}

export interface ExtractedContentMainFile extends ExtractedFile<'main'> {
	label?: string;
	quality?: string;
}
export interface ExtractedContentThumbnailFile
	extends ExtractedFile<'thumbnail'> {
	label?: string;
}
export interface OtherExtractedFile
	extends ExtractedFile<
		'description' | 'metadata' | 'subtitles' | 'other' | 'preview'
	> {
	preserve?: boolean;
}

export type ExtractedContentFile =
	| ExtractedContentMainFile
	| ExtractedContentThumbnailFile;
export type AnyExtractedContentFile = ExtractedContentFile | OtherExtractedFile;

export interface ContentExtractorParameters<ContentSource extends {}> {
	mode?: ContentExtractorMode;
	queuedByUserId: number;
	source: ContentSource;
}

export interface ExtractedContent {
	queuedByUserId: number;
	source: ExtractedContentSourceInfo;
	files: AnyExtractedContentFile[] | null;
	metadata: ExtractedPlatformContentMetadata | null;
}

export interface ContentItemExtractionCleanup {
	files?: string[];
}
export type ContentItemExtractionCallback = (
	content: ExtractedContent,
	cleanup?: ContentItemExtractionCleanup,
) => void;

export type OneToOneContentExtractor<
	ContentSource extends {} = any,
	Options extends {} = Record<string, never>,
> = (
	params: ContentExtractorParameters<ContentSource>,
	options: Options,
	context: PluginCallContext,
) => Promise<ExtractedContent>;

export type OneToManyContentExtractor<
	ContentSource extends {} = any,
	Options extends {} = Record<string, never>,
> = (
	params: ContentExtractorParameters<ContentSource>,
	options: Options,
	context: PluginCallContext,
	callbacks: {
		onContentItemExtracted: ContentItemExtractionCallback;
		onContentItemExtractionFailed: ContentItemExtractionCallback;
	},
) => Promise<ExtractedContent[] | undefined>;

export type ManyToManyContentExtractor<
	ContentSource extends {} = any,
	Options extends {} = Record<string, never>,
> = (
	params: ContentExtractorParameters<ContentSource>[],
	options: Options,
	context: PluginCallContext,
	callbacks: {
		onContentItemExtracted: ContentItemExtractionCallback;
		onContentItemExtractionFailed: ContentItemExtractionCallback;
	},
) => Promise<
	| {
			extracted: ExtractedContent[];
			failed: ContentExtractorParameters<any>[];
	  }
	| undefined
>;

export type ContentExtractor<ExtractorType extends ContentExtractorType> =
	ExtractorType extends 'one-to-one'
		? OneToOneContentExtractor
		: ExtractorType extends 'one-to-many'
			? OneToManyContentExtractor
			: ExtractorType extends 'many-to-many'
				? ManyToManyContentExtractor
				: never;
