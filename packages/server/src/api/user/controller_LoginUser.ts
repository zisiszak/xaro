import { type RequestHandler } from 'express';
import { validateUserAccessCredentials } from '~/data/access/user.js';
import { __coreParams } from '../../config/core-params.js';
import {
	userAccessTokenKey,
	type UserAccessTokenPayload,
} from '../../data/model/shared/user-access-token.js';
import { logger } from '../../index.js';
import { encodeJWT } from '../../utils/web-auth/json-web-token.js';
import { parseBasicAuthHeader } from '../../utils/web-auth/parse-basic-auth-header.js';

export type Success = Omit<UserAccessTokenPayload, 'expiry'>;
export type Failure = undefined;
export type Result = Success | Failure;

export const LoginUserController: RequestHandler<never, Result> = (
	req,
	res,
) => {
	const auth = parseBasicAuthHeader(req.headers);
	if (typeof auth === 'undefined' || auth === null) {
		res.status(400).end();
		return;
	}

	return validateUserAccessCredentials(auth)
		.then((data) => {
			if (typeof data !== 'string') {
				res.cookie(
					userAccessTokenKey,
					encodeJWT({
						...data,
						expiry: Date.now() + __coreParams.userAccessTokenExpiry,
					}),
					{
						httpOnly: true,
						maxAge: __coreParams.userAccessTokenExpiry,
					},
				)
					.status(200)
					.json(data)
					.end();
				return;
			}

			res.status(401).end();
		})
		.catch((err) => {
			logger.error(err, 'loginUser: Unhandled exception.');
			res.status(500).end();
		});
};
