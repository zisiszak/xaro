import { cleanString } from '@xaro/utils';
import { type RequestHandler } from 'express';
import { type PlatformProfile } from '../../data/model/tables/index.js';
import { db, logger } from '../../index.js';
import { $callSelect, selectFirst } from '../../libs/kysely/index.js';
import {
	limitOrderSort,
	parseLimitOrderSortFactory,
	type LimitOrderSort,
} from '../../libs/kysely/limit-order-sort.js';
import { type ApiSortedArray } from '../shared.js';

export interface Params {
	platformName: string;
}

export type Query = LimitOrderSort<
	'PlatformProfile' | 'UserLinkedPlatformProfile'
>;
export type Success = ApiSortedArray<
	PlatformProfile.Selection,
	ReturnType<typeof parseLimitOrderSort>
>;
export type Failure = string;
export type Result = Success | Failure;

const parseLimitOrderSort = parseLimitOrderSortFactory<'PlatformProfile'>({
	allowUnmappedOrderReferences: true,
	defaultOrderBy: 'PlatformProfile.displayName',
});
export const GetAllPlatformProfilesController: RequestHandler<
	Params,
	Result,
	never,
	Query
> = async (req, res) => {
	const userId = req.forwarded.user!.id;
	const platform = cleanString(req.params.platformName);
	if (typeof platform === 'undefined') {
		return res.status(400).end();
	}

	const los = parseLimitOrderSort(req.query);

	const platformId = await db
		.selectFrom('Platform')
		.select('id')
		.where('name', '=', platform)
		.$call($callSelect.first)
		.then((result) => result?.id)
		.catch((err: unknown) => {
			logger.error(
				{ error: err },
				'LinkedPlatformProfilesController: Unhandled exception.',
			);
			res.status(500).end();
			return null;
		});
	if (typeof platformId === 'undefined') {
		return res.status(404).end();
	}

	const baseQ = db
		.selectFrom('PlatformProfile')
		.selectAll('PlatformProfile')
		.where('PlatformProfile.linkedPlatformId', '=', platformId)
		.$if(req.forwarded.user!.role !== 'admin', (qb) =>
			qb
				.innerJoin(
					'UserLinkedPlatformProfile',
					'PlatformProfile.id',
					'UserLinkedPlatformProfile.linkedPlatformProfileId',
				)
				.where((eb) =>
					eb.and([
						eb('PlatformProfile.linkedPlatformId', '=', platformId),
						eb(
							'UserLinkedPlatformProfile.linkedUserId',
							'=',
							userId,
						),
					]),
				)
				.select([
					'PlatformProfile.id as id',
					'UserLinkedPlatformProfile.linkedPlatformProfileId as id',
				]),
		);

	const platformProfileIds = await baseQ
		.$call((qb) => limitOrderSort(qb, los))
		.execute()
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
				},
				'LinkedPlatformProfilesController: Unhandled exception.',
			);
			res.status(500).end();
		});
	if (!platformProfileIds) {
		return;
	}

	const count = await baseQ
		.clearSelect()
		.select((eb) => eb.fn.count<number>('PlatformProfile.id').as('count'))
		.$call(selectFirst)
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
				},
				'LinkedPlatformProfilesController: Unhandled exception.',
			);
			res.status(500).end();
		});
	if (!count) {
		return;
	}

	res.status(200)
		.json({
			parsedSorting: los,
			parsedFilters: {},
			results: platformProfileIds,
			totalCount: count.count,
		})
		.end();
};
