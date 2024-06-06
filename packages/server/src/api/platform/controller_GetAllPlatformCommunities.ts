import { type RequestHandler } from 'express';
import { db, logger } from '../../index.js';
import { selectFirst } from '../../libs/kysely/index.js';
import {
	limitOrderSort,
	parseLimitOrderSortFactory,
	type LimitOrderSortReqQueryParams,
} from '../../libs/kysely/limit-order-sort.js';
import { type ApiSortedArray } from '../shared.js';

export type Query = LimitOrderSortReqQueryParams<
	'PlatformCommunity' | 'UserLinkedPlatformCommunity'
>;
export type Success = ApiSortedArray<
	{
		id: number;
		displayName: string;
	},
	ReturnType<typeof parseLimitOrderSort>
>;
export type Failure = string;
export type Result = Success | Failure;

const parseLimitOrderSort = parseLimitOrderSortFactory<
	'PlatformCommunity' | 'UserLinkedPlatformCommunity'
>({
	allowUnmappedOrderReferences: true,
	defaultOrderBy: 'PlatformCommunity.displayName',
});
export const GetAllPlatformCommunitiesController: RequestHandler<
	never,
	Result,
	never,
	Query
> = async (req, res) => {
	const user = req.forwarded.user!;
	const platformId = req.forwarded.platform!.id!;

	const los = parseLimitOrderSort(req.query);

	const platformCommunities = await db
		.selectFrom('UserLinkedPlatformCommunity')
		.innerJoin(
			'PlatformCommunity',
			'PlatformCommunity.id',
			'UserLinkedPlatformCommunity.linkedPlatformCommunityId',
		)
		.where((eb) =>
			eb.and([
				eb('PlatformCommunity.linkedPlatformId', '=', platformId),
				eb('UserLinkedPlatformCommunity.linkedUserId', '=', user.id),
			]),
		)
		.select([
			'UserLinkedPlatformCommunity.linkedPlatformCommunityId as id',
			'PlatformCommunity.id as id',
			'PlatformCommunity.displayName',
		])
		.$call((qb) => limitOrderSort(qb, los))
		.execute()
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
				},
				'LinkedPlatformCommunitiesController: Unhandled exception',
			);
			res.status(500).end();
		});
	if (!platformCommunities) {
		return;
	}

	const total = await db
		.selectFrom(['UserLinkedPlatformCommunity', 'PlatformCommunity'])
		.select((cb) =>
			cb.fn
				.count<number>('PlatformCommunity.id')
				.filterWhere((eb) =>
					eb.and([
						eb(
							'UserLinkedPlatformCommunity.linkedUserId',
							'=',
							user.id,
						),
						eb(
							'PlatformCommunity.linkedPlatformId',
							'=',
							platformId,
						),
					]),
				)
				.as('count'),
		)
		.groupBy('UserLinkedPlatformCommunity.linkedUserId')
		.$call(selectFirst)
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
				},
				'LinkedPlatformCommunitiesController: Unhandled exception.',
			);
			res.status(500).end();
		});
	if (!total) {
		return;
	}

	if (typeof total === 'undefined') {
		logger.error(total, 'Failed to get platform community count');
		return res.status(404).end();
	}

	res.status(200)
		.json({
			parsedSorting: los,
			parsedFilters: {},
			results: platformCommunities ?? [],
			totalCount: total.count,
		})
		.end();
};
