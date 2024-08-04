import { type RequestHandler } from 'express';
import { USER_ACCESS_TOKEN_KEY } from '~/process/index.js';

export const LogoutUserController: RequestHandler = (_, res) =>
	void res.clearCookie(USER_ACCESS_TOKEN_KEY).status(205).end();
