import { cleanString } from '@xaro/utils';
import { type RequestHandler } from 'express';
import { db } from '../../index.js';
import { selectFirst } from '../../libs/kysely/index.js';

export const AuthorizePlatformAccessMiddleware: RequestHandler<
	any,
	any,
	any,
	any
> = async (req, res, next) => {
	const user = req.forwarded.user!;

	let platformName: string | undefined;
	if (req.originalUrl.startsWith('/static.asset/platform/')) {
		const staticPath = req.originalUrl.slice(23);
		platformName = staticPath.slice(0, staticPath.indexOf('/'));
	} else {
		platformName =
			cleanString(req.params.platformName) ??
			cleanString(req.body.platformName) ??
			cleanString(req.query.platformName);
	}

	if (!platformName) {
		return res.status(400).end();
	}

	const name = platformName;

	let q = db
		.selectFrom('Platform')
		.select([
			'platformManager',
			'genericPlatformsManager',
			'mediaExtractor',
			'metadataExtractor',
			'id as platformId',
			'name as platformName',
		]);

	if (user.role === 'admin') {
		q = q.where('name', '=', name);
	} else {
		q = q
			.innerJoin(
				'UserLinkedPlatform',
				'Platform.id',
				'UserLinkedPlatform.linkedPlatformId',
			)
			.select('UserLinkedPlatform.linkedPlatformId as platformId')
			.where((eb) =>
				eb.and([
					eb('UserLinkedPlatform.linkedUserId', '=', user.id),
					eb('Platform.name', '=', name),
				]),
			);
	}

	const platform = await q.$call(selectFirst);
	if (typeof platform === 'undefined') {
		return res.status(401).end();
	}

	req.forwarded.platform = {
		id: platform.platformId,
		name: platform.platformName,
		platformManager: platform.platformManager,
		mediaExtractor: platform.mediaExtractor,
		metadataExtractor: platform.metadataExtractor,
		genericPlatformsManager: platform.genericPlatformsManager,
	};
	next();
};
