import { type RequestHandler } from 'express';
import { logger } from '~/index.js';
import {
	USER_ACCESS_TOKEN_KEY,
	getUserRecord,
	isUserAccessTokenPayload,
} from '~/modules/users/index.js';
import { jwt } from '~/utils/index.js';

export interface Status500_UnexpectedError {}
export interface Status401_AccessTokenExpired {}
export interface Status403_UserDoesNotExist {}

export type ResponseBody =
	| Status401_AccessTokenExpired
	| Status403_UserDoesNotExist
	| Status500_UnexpectedError;

/**
 * This middleware ensures that the `userAccessToken` property is defined for any request handler that follows.
 *
 *  It decodes a request's {@link UserAccessTokenPayload} if it exists, and checks if the decoded `id` exists in the `User` table. Also resigns the token if it has outdated properties.
 */
export const userAccessTokenMiddleware: RequestHandler<never, ResponseBody> = async (
	req,
	res,
	next,
) => {
	const cookie = req.cookies[USER_ACCESS_TOKEN_KEY] as string | undefined;
	if (!cookie) return void res.status(401).end();

	let accessTokenPayload = jwt.decode(cookie, isUserAccessTokenPayload);
	if (!accessTokenPayload) return void res.status(500).end();
	if (accessTokenPayload.expiry < Date.now()) {
		// TODO: Make this send some context to the client?
		return void res.status(401).end();
	}

	const user = await getUserRecord(accessTokenPayload.userID);
	if (!user) return void res.status(403).end();

	if (user.role !== accessTokenPayload.role || user.username !== accessTokenPayload.username) {
		logger.info({
			message: 'User access token is outdated. Resigning to reflect changes.',
			context: {
				userID: user.id,
			},
		});

		const originalExpiry = accessTokenPayload.expiry;

		accessTokenPayload = {
			userID: user.id,
			role: user.role,
			username: user.username,
			expiry: originalExpiry,
		};

		res.cookie(USER_ACCESS_TOKEN_KEY, jwt.encode(accessTokenPayload), {
			httpOnly: true,
			expires: new Date(accessTokenPayload.expiry),
		});
	}

	req.userAccessToken = accessTokenPayload;
	next();
};
