import { newError } from 'exitus';
import { type RequestHandler } from 'express';
import { xaro } from '~/index.js';
import {
	USER_ACCESS_TOKEN_KEY,
	isUserAccessTokenPayload,
	userRepository,
} from '~/modules/users/index.js';
import { jwt } from '~/utils/index.js';

/**
 * This middleware ensures that the `userAccessToken` property is defined for any request handler that follows.
 *
 *  It decodes a request's {@link UserAccessTokenPayload} if it exists, and checks if the decoded `id` exists in the `User` table. Also resigns the token if it has outdated properties.
 */
export const UserAccessTokenMiddleware: RequestHandler = (req, res, next) => {
	const cookie = req.cookies[USER_ACCESS_TOKEN_KEY] as string | undefined;
	if (!cookie) {
		res.status(401).end();
		return;
	}

	const user = jwt.decode(cookie, isUserAccessTokenPayload);
	if (!user) {
		res.status(401).end();
		return;
	}
	if (user.expiry < Date.now()) {
		// TODO: Make this send some context to the client
		res.status(401).end();
		return;
	}

	return userRepository
		.findByID(user.id)
		.then((data) => {
			if (!data) {
				res.status(403).end();
				return;
			}

			if (data.role !== user.role || data.username !== user.username) {
				xaro.log.info(
					{
						userData: data,
						tokenPayload: user,
					},
					'User access token data outdated. Resigning token to reflect changes...',
				);
				res.cookie(
					USER_ACCESS_TOKEN_KEY,
					jwt.encode({
						...data,
						expiry: user.expiry,
					}),
					{
						httpOnly: true,
						expires: new Date(user.expiry),
					},
				);
			}

			req.userAccessToken = { ...data, expiry: user.expiry };

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
			});
			res.status(500).end();
		});
};
