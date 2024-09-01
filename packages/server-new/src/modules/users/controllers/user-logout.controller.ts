import { type RequestHandler } from 'express';
import { USER_ACCESS_TOKEN_KEY } from '../model/user-access-token.js';

export const userLogoutController: RequestHandler = (_, res) =>
	void res.clearCookie(USER_ACCESS_TOKEN_KEY).status(205).end();
