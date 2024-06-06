import { type RequestHandler } from 'express';
import { userAccessTokenKey } from '../../data/model/shared/user-access-token.js';

export const LogoutUserController: RequestHandler = (_, res) =>
	res.clearCookie(userAccessTokenKey).status(205).end();
