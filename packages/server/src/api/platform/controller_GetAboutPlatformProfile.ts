import { cleanInt } from '@xaro/utils';
import { newError } from 'exitus';
import { type RequestHandler } from 'express';
import { getPlatformNameFromId } from '~/data/access/platform.js';
import { type PlatformProfile } from '../../data/model/tables/index.js';
import { db, logger } from '../../index.js';
import { selectFirst } from '../../libs/kysely/index.js';

export type Success = {
	profile: PlatformProfile.Selection;
	platformId: number;
	platformName: string;
};
export type Failure = undefined;
export type Result = Success | Failure;
export type Params = {
	profileId: string;
};

export const GetAboutPlatformProfileController: RequestHandler<Params, Result> = async (
	req,
	res,
) => {
	const platformProfileId = cleanInt(req.params.profileId);
	if (typeof platformProfileId === 'undefined') {
		return res.status(400).end();
	}

	return db
		.selectFrom('PlatformProfile')
		.selectAll('PlatformProfile')
		.$if(req.forwarded.user!.role !== 'admin', (qb) =>
			qb
				.innerJoin(
					'UserLinkedPlatformProfile',
					'PlatformProfile.id',
					'UserLinkedPlatformProfile.linkedPlatformProfileId',
				)
				.select('UserLinkedPlatformProfile.linkedPlatformProfileId as id')
				.where('UserLinkedPlatformProfile.linkedUserId', '=', req.forwarded.user!.id),
		)
		.innerJoin(
			'PlatformLinkedContent',
			'PlatformProfile.id',
			'PlatformLinkedContent.linkedPlatformProfileId',
		)
		.select((cb) => cb.fn.count('PlatformLinkedContent.id').as('count'))
		.groupBy('PlatformLinkedContent.linkedPlatformProfileId')
		.where('PlatformProfile.id', '=', platformProfileId)
		.$call(selectFirst)
		.then(async (platformProfile) => {
			if (typeof platformProfile === 'undefined') {
				return res.status(404).end();
			}
			if (platformProfile.assets) {
				platformProfile.assets =
					(typeof platformProfile.assets as any) === 'string'
						? (JSON.parse(
								platformProfile.assets as unknown as string,
							) as PlatformProfile.Selection['assets'])
						: platformProfile.assets;
			}

			const platformName = await getPlatformNameFromId(
				platformProfile.linkedPlatformId,
			).catch(() => null);
			if (platformName === null) {
				newError({
					message:
						'Failed to resolve platform name from platformId that was assigned to a platform profile.',
					context: {
						platformProfileId: platformProfile.id,
						linkedPlatformId: platformProfile.linkedPlatformId,
					},
					log: 'error',
				});
				return res.status(500).end();
			}

			res.status(200)
				.json({
					profile: platformProfile,
					platformName: platformName,
					platformId: platformProfile.linkedPlatformId,
				})
				.end();
		})
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
				},
				'AboutPlatformProfileController: Unhandled exception.',
			);
			res.status(500).end();
		});
};
