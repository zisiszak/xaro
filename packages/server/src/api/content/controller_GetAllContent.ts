import { exitus } from 'exitus';
import { type RequestHandler } from 'express';
import { sql } from 'kysely';
import { getRelatedContentData } from '../../data/access/content.js';
import { type Rating } from '../../data/model/tables/UserLinkedContent.js';
import { db, logger } from '../../index.js';
import { $callSelect } from '../../libs/kysely/index.js';
import {
	parseLimitOrderSortFactory,
	type LimitOrderSortReqQueryParams,
} from '../../libs/kysely/limit-order-sort.js';
import { type ApiSortedArray } from '../shared.js';
import { ContentFiltering, parseContentFiltering } from './shared.js';
import { type GetAboutContent } from './types.js';

export type Query = ContentFiltering & LimitOrderSortReqQueryParams<'Content'>;
export type Success = ApiSortedArray<GetAboutContent.Success>;
export type Failure = undefined;
export type Result = Success | Failure;

const parseLimitOrderSort = parseLimitOrderSortFactory<
	'PlatformLinkedContent' | 'Content'
>({
	allowUnmappedOrderReferences: true,
	defaultOrderBy: 'Content.dateAdded',
	defaultLimit: 50,
	maxLimit: 100,
});

export const GetAllContentController: RequestHandler<
	never,
	Result,
	never,
	Query
> = async (req, res) => {
	const userId = req.forwarded.user!.id;
	const query = req.query;
	const los = parseLimitOrderSort(query);
	const {
		search,
		platform,
		contentKind,
		platformId,
		platformCommunity,
		platformCommunityId,
		platformProfile,
		platformProfileId,
		isFavourite,
		minRating,
		sortingTags,
	} = parseContentFiltering(query);

	let q = db
		.selectFrom('Content')
		.select(['Content.id as contentId', 'Content.kind as contentKind'])
		.innerJoin(
			'UserLinkedContent',
			'Content.id',
			'UserLinkedContent.linkedContentId',
		)
		.where('UserLinkedContent.linkedUserId', '=', userId)
		.innerJoin(
			'PlatformLinkedContent',
			'PlatformLinkedContent.linkedContentId',
			'Content.id',
		);

	if (typeof isFavourite !== 'undefined') {
		q = q.where('UserLinkedContent.isFavourite', '=', isFavourite);
	}
	if (typeof minRating === 'number') {
		q = q.where('UserLinkedContent.rating', '>=', minRating as Rating);
	}

	if (typeof platformId !== 'undefined' || typeof platform !== 'undefined') {
		q = q.where(
			'PlatformLinkedContent.linkedPlatformId',
			typeof platformId !== 'undefined' ? '=' : 'in',
			typeof platformId !== 'undefined'
				? platformId
				: sql<number>`(SELECT Platform.id as linkedPlatformId from Platform WHERE Platform.name = ${platform})`,
		);
	}

	if (
		typeof platformCommunity !== 'undefined' ||
		typeof platformCommunityId !== 'undefined'
	) {
		q = q.where(
			'PlatformLinkedContent.linkedPlatformCommunityId',
			typeof platformCommunityId !== 'undefined' ? '=' : '=',
			typeof platformCommunityId !== 'undefined'
				? platformCommunityId
				: sql<number>`(SELECT PlatformCommunity.id from PlatformCommunity WHERE PlatformCommunity.name LIKE ${`%${platformCommunity!}%`})`,
		);
	}

	if (
		typeof platformProfile !== 'undefined' ||
		typeof platformProfileId !== 'undefined'
	) {
		q = q.where(
			'PlatformLinkedContent.linkedPlatformProfileId',
			typeof platformProfileId !== 'undefined' ? '=' : 'in',
			typeof platformProfileId !== 'undefined'
				? platformProfileId
				: sql<number>`(SELECT PlatformProfile.id FROM PlatformProfile WHERE PlatformProfile.name LIKE ${`%${platformProfile!}%`})`,
		);
	}

	if (contentKind) {
		q = q.where('Content.kind', '=', contentKind);
	}

	if (search) {
		const likeSearch = `%${search}%`;
		q = q.where(
			() => sql`
		(PlatformLinkedContent.sourceUrl = ${search}
			OR PlatformLinkedContent.sourcePageUrl = ${search}
			OR PlatformLinkedContent.description LIKE ${likeSearch}
			OR PlatformLinkedContent.title LIKE ${likeSearch}
			OR PlatformLinkedContent.linkedPlatformProfileId IN (
				SELECT PlatformProfile.id as linkedPlatformProfileId FROM PlatformProfile
				WHERE (
					PlatformProfile.name LIKE ${likeSearch}
					OR PlatformProfile.displayName LIKE ${likeSearch}
				)
			)
			OR PlatformLinkedContent.linkedPlatformCommunityId IN (
				SELECT PlatformCommunity.id as linkedPlatformCommunityId FROM PlatformCommunity
				WHERE (
					PlatformCommunity.name LIKE ${likeSearch}
					OR PlatformCommunity.displayName LIKE ${likeSearch}
				)
			)
			OR PlatformLinkedContent.sourceId = ${search}
			OR PlatformLinkedContent.tags LIKE ${likeSearch}
			OR PlatformLinkedContent.categories LIKE ${likeSearch}
			OR PlatformLinkedContent.genres LIKE ${likeSearch}
			OR Content.id IN (
				SELECT
					SortingTagLinkedContent.linkedContentId as id
				FROM
					SortingTagLinkedContent
				WHERE (
					SortingTagLinkedContent.linkedSortingTagId = (
						SELECT
							SortingTag.id as linkedSortingTagId
						FROM
							SortingTag
						WHERE
							SortingTag.displayName = ${search}
					)
				)
			)
		)`,
		);
	}

	if (sortingTags) {
		q = q
			.innerJoin(
				'SortingTagLinkedContent',
				'SortingTagLinkedContent.linkedContentId',
				'Content.id',
			)
			.where('SortingTagLinkedContent.linkedSortingTagId', 'in', (sb) =>
				sb
					.selectFrom('SortingTag')
					.select('SortingTag.id')
					.where('SortingTag.displayName', 'in', sortingTags),
			);
	}

	const { limit, orderBy, direction, offset } = los;
	if (limit) {
		q = q.limit(limit);
	}
	if (orderBy) {
		q = q.orderBy(orderBy, direction);
	}
	if (offset) {
		q = q.offset(offset);
	}

	const results = await q.execute().catch((err: unknown) => {
		logger.error(
			exitus.newError({
				caughtException: err,
				message: 'Unexpected error querying database.',
			}),
		);
		return null;
	});
	if (results === null) {
		return res.status(500).end();
	}

	const finalResults = Promise.all(
		results.map(async (result) => ({
			record: await db
				.selectFrom('Content')
				.selectAll('Content')
				.innerJoin(
					'PlatformLinkedContent',
					'Content.id',
					'PlatformLinkedContent.linkedContentId',
				)
				.where('Content.id', '=', result.contentId)
				.select([
					'PlatformLinkedContent.ageLimit',
					'PlatformLinkedContent.bodyText',
					'PlatformLinkedContent.categories',
					'PlatformLinkedContent.commentCount',
					'PlatformLinkedContent.dateModified',
					'PlatformLinkedContent.datePublished',
					'PlatformLinkedContent.description',
					'PlatformLinkedContent.dislikeCount',
					'PlatformLinkedContent.genres',
					'PlatformLinkedContent.likeCount',
					'PlatformLinkedContent.likeToDislikeRatio',
					'PlatformLinkedContent.linkedPlatformCommunityId',
					'PlatformLinkedContent.linkedPlatformId',
					'PlatformLinkedContent.linkedPlatformProfileId',
					'PlatformLinkedContent.sourceId',
					'PlatformLinkedContent.sourcePageUrl',
					'PlatformLinkedContent.sourceUrl',
					'PlatformLinkedContent.tags',
					'PlatformLinkedContent.title',
					'PlatformLinkedContent.viewCount',
					'PlatformLinkedContent.linkedContentId',
					'PlatformLinkedContent.sourceMetadataDump',
				])
				.executeTakeFirstOrThrow(),
			...(await getRelatedContentData({
				contentId: result.contentId,
				userId,
				contentKind: result.contentKind,
			})),
		})),
	);

	let totalCount: number = 0;
	if (results.length !== 0) {
		totalCount = await q
			.clearSelect()
			.select((eb) => eb.fn.count<number>('Content.id').as('count'))
			.$call($callSelect.first)
			.then((result) => {
				if (typeof result === 'undefined') {
					return 0;
				}
				return result.count;
			});
	}

	res.status(200).json({
		results: await finalResults,
		totalCount: totalCount,
		parsedFilters: {},
		parsedSorting: {},
	});
};
