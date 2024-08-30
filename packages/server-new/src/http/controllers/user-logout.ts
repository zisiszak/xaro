import { type RequestHandler } from 'express';
import { USER_ACCESS_TOKEN_KEY } from '~/modules/users/index.js';

export const UserLogoutController: RequestHandler = (_, res) =>
	void res.clearCookie(USER_ACCESS_TOKEN_KEY).status(205).end();
