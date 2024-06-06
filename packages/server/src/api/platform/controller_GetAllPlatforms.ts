import { type RequestHandler } from 'express';
import { type Platform } from '../../data/model/tables/index.js';
import { db, logger } from '../../index.js';

export type Success = Platform.Selection[];
export type Failure = undefined;
export type Result = Success | Failure;

export const GetAllPlatformsController: RequestHandler<never, Result> = async (
	req,
	res,
) =>
	db
		.selectFrom('Platform')
		.selectAll('Platform')
		.$if(req.forwarded.user!.role !== 'admin', (qb) =>
			qb
				.innerJoin(
					'UserLinkedPlatform',
					'UserLinkedPlatform.linkedPlatformId',
					'Platform.id',
				)
				.where(
					'UserLinkedPlatform.linkedUserId',
					'=',
					req.forwarded.user!.id,
				)
				.select('UserLinkedPlatform.linkedPlatformId as id'),
		)
		.execute()
		.then((result) => {
			return res.status(200).json(result).end();
		})
		.catch((err: unknown) => {
			logger.error(
				{
					userId: req.forwarded.user!.id,
					error: err,
				},
				'LinkedPlatformsController: Unhandled exception.',
			);
			res.status(500).end();
		});
