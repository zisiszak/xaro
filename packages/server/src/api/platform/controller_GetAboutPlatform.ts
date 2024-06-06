import { type RequestHandler } from 'express';
import { type Platform } from '../../data/model/tables/index.js';
import { db, logger } from '../../index.js';
import { $callSelect } from '../../libs/kysely/index.js';

export type Success = Platform.Selection;
export type Failure = undefined;
export type Result = Success | Failure;

export const GetAboutPlatformController: RequestHandler<never, Result> = (
	req,
	res,
) => {
	// middleware: requirePlatformAccess
	const { id: platformId, name: platformName } = req.forwarded.platform!;

	let q = db.selectFrom('Platform').selectAll();
	if (platformId) {
		q = q.where('id', '=', platformId);
	} else if (platformName) {
		q = q.where('name', '=', platformName);
	} else {
		return res.status(400).end();
	}

	return q
		.$call($callSelect.first)
		.then((result) => {
			if (!result) {
				return res.status(404).end();
			}
			return res.status(200).json(result);
		})
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
					platformId,
				},
				'AboutPlatformController: Unhandled exception.',
			);
			res.status(500).end();
		});
};
