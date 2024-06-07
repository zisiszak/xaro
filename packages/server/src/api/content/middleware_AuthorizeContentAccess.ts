import { cleanInt } from '@xaro/utils';
import { exitus } from 'exitus';
import { type RequestHandler } from 'express';
import { db, logger } from '../../index.js';
import { checkAnyExist, selectFirst } from '../../libs/kysely/index.js';

export const AuthorizeContentAccessMiddleware: RequestHandler<
	{ contentId?: string },
	any,
	{ contentId?: number },
	{ contentId?: number }
> = async (req, res, next) => {
	const user = req.forwarded.user!;

	let contentId: number;
	if (req.originalUrl.startsWith('/static.media/')) {
		const relativeFilePath = req.originalUrl.slice(14);

		const contentLinkedFile = await db
			.selectFrom('ContentFile')
			.select('linkedContentId as id')
			.where('path', '=', relativeFilePath)
			.$call(selectFirst)
			.catch((err: unknown) => {
				logger.error(
					{
						error: err,
					},
					'RequireMediaAccessController: Unhandled exception.',
				);
				res.status(500).end();
				return null;
			});
		if (contentLinkedFile === null) {
			return;
		} else if (typeof contentLinkedFile === 'undefined')
			return res.status(404).end();

		contentId = contentLinkedFile.id;
	} else {
		const id =
			cleanInt(req.params.contentId) ??
			cleanInt(req.body.contentId) ??
			cleanInt(req.query.contentId);
		if (typeof id === 'undefined') return res.status(400).end();

		contentId = id;
	}

	const linkedContentId = contentId;

	// TODO: Update this to reflect new schema
	if (user.role !== 'admin') {
		const authorised = await db
			.selectFrom('UserLinkedContent')
			.select('linkedUserId')
			.where((eb) =>
				eb.or([
					eb.and([
						eb('linkedContentId', '=', linkedContentId),
						eb('linkedUserId', '=', user.id),
					]),
					eb('isPublic', '=', 1),
				]),
			)
			.$call(checkAnyExist)
			.catch((err: unknown) => {
			 exitus.newError({
				kind: exitus.errorKind.unexpected,
					caughtException: err,
					message: 'Unexpected error when querying the database.',
					context: {
						user,
						linkedMediaId: linkedContentId,
					},
				});
				return null;
			});
		if (authorised === null) {
			return res.status(500).end();
		} else if (!authorised) {
			return res.status(401).end();
		}
	}

	req.forwarded.content = {
		id: contentId,
	};
	next();
};
