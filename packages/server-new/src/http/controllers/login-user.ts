import { newError } from 'exitus';
import { type RequestHandler } from 'express';
import { USER_ACCESS_TOKEN_EXPIRY_TIME, USER_ACCESS_TOKEN_KEY } from '~/process/index.js';
import { jwt } from '~/utils/index.js';
import { validateUserCredentials } from '../services/index.js';

export const LoginUserController: RequestHandler = async (req, res) => {
	await validateUserCredentials(req.basicAuth!)
		.then((data) => {
			if (!data) {
				res.status(401).end();
				return;
			}

			res.cookie(
				USER_ACCESS_TOKEN_KEY,
				jwt.encode({
					...data,
					expiry: Date.now() + USER_ACCESS_TOKEN_EXPIRY_TIME,
				}),
				{
					httpOnly: true,
					maxAge: USER_ACCESS_TOKEN_EXPIRY_TIME,
				},
			)
				.status(200)
				.json(data)
				.end();
		})
		.catch((err) => {
			newError({
				caughtException: err,
				message: 'An unexpected error occurred while logging in a user.',
				log: 'error',
			});
			res.status(500).end();
		});
};
