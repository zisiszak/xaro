import { type RequestHandler } from 'express';
import { USER_ACCESS_TOKEN_COOKIE_KEY } from '../access-token/constants.js';

export const userLogoutController: RequestHandler = (_, res) =>
	void res.clearCookie(USER_ACCESS_TOKEN_COOKIE_KEY).status(205).end();
