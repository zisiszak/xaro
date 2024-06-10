import { cleanString } from '@xaro/utils';
import { isError, newError } from 'exitus';
import { RequestHandler } from 'express';
import { getPlatformNameFromId, linkUserToPlatform } from '~/data/access/platform.js';
import { logger } from '~/index.js';
import { addUnidentifiedPlatform } from '~/services/platform/auto-platform.js';
import { matchUrlToPlatformId } from '~/services/platform/match-url-to-platform.js';

export interface AutoAddBody {
	addFromUrl: string;
}
export type Body = AutoAddBody;

export interface Success {
	platformId: number;
	platformName: string;
	created: boolean;
	userIsLinked: boolean;
}
export type Failure = undefined;
export type Result = Success | Failure;

export const AddPlatformController: RequestHandler<never, Result, Body> = async (req, res) => {
	const { id: userId } = req.forwarded.user!;

	if (req.body.addFromUrl) {
		const addFromUrl = cleanString(req.body.addFromUrl);
		if (!addFromUrl) {
			return res.status(400).end();
		}

		let created: boolean = false;
		return matchUrlToPlatformId(addFromUrl)
			.then(async (existingPlatformId) => {
				if (typeof existingPlatformId === 'number') {
					return existingPlatformId;
				}

				created = true;
				return addUnidentifiedPlatform({
					inputUrl: addFromUrl,
					userId: userId,
				}).catch((err) => {
					logger.error(
						isError(err)
							? err
							: newError({
									message: 'Unexpected error adding unidentified platform.',
									caughtException: err,
									context: {
										addFromUrl,
										userId,
									},
								}),
					);

					return undefined;
				});
			})
			.then(async (platformId) => {
				if (typeof platformId === 'undefined') {
					res.status(422).end();
					return;
				}
				const name = await getPlatformNameFromId(platformId);

				const userIsLinked = await linkUserToPlatform({
					userId,
					platformId,
				}).then((result) => !isError(result));

				res.status(200).json({
					created,
					userIsLinked,
					platformId,
					platformName: name,
				});
				return;
			});
	}

	return res.status(400);
};
