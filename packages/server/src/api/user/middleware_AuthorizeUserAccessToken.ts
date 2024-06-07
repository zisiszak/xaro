import { newError } from 'exitus';
import { type RequestHandler } from 'express';
import {
	isUserAccessTokenPayload,
	userAccessTokenKey,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
	type UserAccessTokenPayload,
} from '../../data/model/shared/user-access-token.js';
import { db, logger } from '../../index.js';
import { $callSelect } from '../../libs/kysely/index.js';
import { decodeJWT, encodeJWT } from '../../utils/web-auth/json-web-token.js';

/**
 * This middleware ensures that the `userAccess` property is defined for any request handler that follows.
 *
 *  It decodes a request's {@link UserAccessTokenPayload} if it exists, and checks if the decoded `id` exists in the `User` table. Also resigns the token if it has outdated properties.
 */
export const AuthorizeUserAccessTokenMiddleware: RequestHandler = (req, res, next) => {
	const cookie = req.cookies[userAccessTokenKey] as string | undefined;
	if (!cookie) {
		return res.status(401).end();
	}
	req.cookies;
	const user = decodeJWT(cookie, isUserAccessTokenPayload);
	if (user === null) {
		return res.status(401).end();
	}
	if (user.expiry < Date.now()) {
		// TODO: Make this send some context to the client
		return res.status(401).end();
	}

	return db
		.selectFrom('User')
		.select(['User.id', 'User.username', 'User.role'])
		.where('id', '=', user.id)
		.$call($callSelect.first)
		.then((data) => {
			if (!data) {
				return res.status(403).end();
			}

			if (data.role !== user.role || data.username !== user.username) {
				logger.info(
					{
						userData: data,
						tokenPayload: user,
					},
					'User access token data outdated. Resigning token to reflect changes...',
				);
				res.cookie(
					userAccessTokenKey,
					encodeJWT({
						...data,
						expiry: user.expiry,
					}),
					{
						httpOnly: true,
						expires: new Date(user.expiry),
					},
				);
			}

			req.forwarded.user = {
				...data,
				expiry: user.expiry,
			};
			next();
		})
		.catch((err) => {
			newError({
				message: 'Unhandled exception attempting to authorize user access token.',
				caughtException: err,
				log: 'error',
				context: {
					user,
				},
			}),
				res.status(500).end();
		});
};
