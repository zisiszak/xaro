import { type RequestHandler } from 'express';
import { logger } from '~/index.js';
import { jwt } from '~/utils/json-web-token.js';
import { User } from '../User.js';
import { isUserAccessTokenPayload, USER_ACCESS_TOKEN_COOKIE_KEY } from '../access-token/index.js';

/**
 * This middleware ensures that the `userAccessToken` property is defined for any request handler that follows.
 *
 *  It decodes a request's {@link UserAccessTokenPayload} if it exists, and checks if the decoded `userID` exists in the `User` table. Also resigns the token if it has outdated properties.
 */
export const userAccessTokenMiddleware: RequestHandler<any> = async (req, res, next) => {
	const cookie = req.cookies[USER_ACCESS_TOKEN_COOKIE_KEY] as string | undefined;
	if (!cookie) return void res.status(401).end();

	let accessTokenPayload = jwt.decode(cookie, isUserAccessTokenPayload);
	if (!accessTokenPayload) return void res.status(401).end();
	if (accessTokenPayload.expiry < Date.now()) {
		// TODO: Make this send some context to the client?
		return void res.status(401).end();
	}

	const user = await User.getAboutUser(accessTokenPayload.userID);
	if (!user) return void res.status(401).end();

	if (user.role !== accessTokenPayload.role || user.username !== accessTokenPayload.username) {
		logger.info(
			{
				userID: user.id,
			},
			'User access token is outdated. Resigning to reflect changes.',
		);

		const originalExpiry = accessTokenPayload.expiry;

		accessTokenPayload = {
			userID: user.id,
			role: user.role,
			username: user.username,
			expiry: originalExpiry,
		};

		res.cookie(USER_ACCESS_TOKEN_COOKIE_KEY, jwt.encode(accessTokenPayload), {
			httpOnly: true,
			expires: new Date(accessTokenPayload.expiry),
		});
	}

	req.userAccessToken = accessTokenPayload;
	next();
};
