import { cleanInt } from '@xaro/utils';
import { type RequestHandler } from 'express';
import { type PlatformCommunity } from '../../data/model/tables/index.js';
import { db, logger } from '../../index.js';
import { selectFirst } from '../../libs/kysely/index.js';

export type Success = PlatformCommunity.Selection;
export type Failure = void;
export type Result = Success | Failure;
export type Params = {
	communityId: string;
};

export const GetAboutPlatformCommunityController: RequestHandler<
	Params,
	Result
> = async (req, res) => {
	const platformCommunityId = cleanInt(req.params.communityId);
	if (typeof platformCommunityId === 'undefined') {
		return res.status(400).end();
	}

	return db
		.selectFrom('PlatformCommunity')
		.selectAll('PlatformCommunity')
		.innerJoin(
			'UserLinkedPlatformCommunity',
			'PlatformCommunity.id',
			'UserLinkedPlatformCommunity.linkedPlatformCommunityId',
		)
		.select('UserLinkedPlatformCommunity.linkedPlatformCommunityId as id')
		.innerJoin(
			'PlatformLinkedContent',
			'PlatformCommunity.id',
			'PlatformLinkedContent.linkedPlatformCommunityId',
		)
		.select((cb) => cb.fn.count('PlatformLinkedContent.id').as('count'))
		.groupBy('PlatformLinkedContent.linkedPlatformCommunityId')
		.where(
			'UserLinkedPlatformCommunity.linkedUserId',
			'=',
			req.forwarded.user!.id,
		)
		.where('PlatformCommunity.id', '=', platformCommunityId)
		.$call(selectFirst)
		.then((platformCommunity) => {
			if (typeof platformCommunity === 'undefined') {
				return res.status(404).end();
			}
			if (platformCommunity.assets) {
				platformCommunity.assets =
					(typeof platformCommunity.assets as any) === 'string'
						? JSON.parse(
								platformCommunity.assets as unknown as string,
							)
						: platformCommunity.assets;
			}

			res.status(200).json(platformCommunity).end();
		})
		.catch((err: unknown) => {
			logger.error(
				{ error: err },
				'AboutPlatformCommunityController: Unhandled exception',
			);
			res.status(500).end();
			return null;
		});
};
