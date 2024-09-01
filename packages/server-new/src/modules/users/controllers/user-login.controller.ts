import { type RequestHandler } from 'express';
import { jwt } from '~/utils/json-web-token.js';
import {
	USER_ACCESS_TOKEN_EXPIRY_TIME,
	USER_ACCESS_TOKEN_KEY,
} from '../model/user-access-token.js';
import { authenticateUserCredentials } from '../services/authenticate-user-credentials.js';

export interface Status400_NoUsernameProvided {}
export interface Status401_UserNotFound {}
export interface Status401_InvalidCredentials {}
export interface Status200_LoggedIn {
	userID: number;
	username: string;
}

export type ResponseBody =
	| Status200_LoggedIn
	| Status400_NoUsernameProvided
	| Status401_InvalidCredentials
	| Status401_UserNotFound;

export const userLoginController: RequestHandler = async (req, res) => {
	const { username, password } = req.basicAuth!;
	if (username === '') return void res.status(400).end();

	const accessTokenPayload = await authenticateUserCredentials(username, password);
	if (accessTokenPayload === false) return void res.status(401).end();
	// I don't know if there's a better status code to be using when the user doesn't exist. 404 doesn't seem right.
	if (typeof accessTokenPayload === 'undefined') return void res.status(401).end();

	res.cookie(USER_ACCESS_TOKEN_KEY, jwt.encode(accessTokenPayload), {
		httpOnly: true,
		maxAge: USER_ACCESS_TOKEN_EXPIRY_TIME,
	})
		.status(200)
		.json({ username: accessTokenPayload.username, userID: accessTokenPayload.userID })
		.end();
};
