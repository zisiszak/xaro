import { type RequestHandler } from 'express';
import {
	hashPassword,
	USER_ACCESS_TOKEN_EXPIRY_TIME,
	USER_ACCESS_TOKEN_KEY,
	userRepository,
} from '~/modules/users/index.js';
import { jwt } from '~/utils/json-web-token.js';

export const UserLoginController: RequestHandler = async (req, res) => {
	const { username, password } = req.basicAuth!;
	if (username === '') return void res.status(400).end();

	const user = await userRepository.findByUsername(username);
	if (!user) return void res.status(401).end();
	if (
		!!user.passwordSalt &&
		(!password || hashPassword(password, user.passwordSalt) !== user.passwordHash)
	)
		return void res.status(401).end();

	const payload = {
		username: user.username,
		id: user.id,
		role: user.role,
	};

	res.cookie(
		USER_ACCESS_TOKEN_KEY,
		jwt.encode({
			...payload,
			expiry: Date.now() + USER_ACCESS_TOKEN_EXPIRY_TIME,
		}),
		{
			httpOnly: true,
			maxAge: USER_ACCESS_TOKEN_EXPIRY_TIME,
		},
	)
		.status(200)
		.json(payload)
		.end();
};
