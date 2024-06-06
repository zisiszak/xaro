import { type RequestHandler } from 'express';
import { __coreParams } from '../../config/core-params.js';
import { db, logger } from '../../index.js';
import { $callInsert, $callSelect } from '../../libs/kysely/index.js';
import { hashPassword } from '../../utils/web-auth/hash-password.js';
import { parseBasicAuthHeader } from '../../utils/web-auth/parse-basic-auth-header.js';

export type Failure =
	| 'USERNAME_TOO_SHORT'
	| 'PASSWORD_TOO_SHORT'
	| 'USERNAME_TAKEN';

export type Success = {
	registered: true;
	username: string;
};
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type Result = Success | Failure;

export const RegisterUserController: RequestHandler<never, Result> = async (
	req,
	res,
) => {
	const auth = parseBasicAuthHeader(req.headers);
	if (!auth) {
		res.status(400).end();
		return;
	}

	const { username, password } = auth;

	if (username.length < __coreParams.userMinUsernameLength) {
		res.status(400).send('USERNAME_TOO_SHORT');
		return;
	}
	if (password && password.length < __coreParams.userMinPasswordLength) {
		res.status(400).send('PASSWORD_TOO_SHORT');
		return;
	}

	return db
		.selectFrom('User')
		.select('id')
		.where('username', '=', username)
		.$call($callSelect.first)
		.then((result) => typeof result !== 'undefined')
		.then(async (usernameTaken) => {
			if (usernameTaken) {
				res.status(409).send('USERNAME_TAKEN').end();
				return Promise.reject();
			}

			const hashedAuth = password ? hashPassword(password) : null;
			return db
				.insertInto('User')
				.values({
					username,
					role: 'user',
					passwordSalt: hashedAuth?.salt ?? null,
					passwordHash: hashedAuth?.hash ?? null,
				})
				.$call($callInsert.onConflictThrow)
				.then((id) => {
					logger.info(
						{ id, username, role: 'user' },
						'New user registered.',
					);
					res.status(201).json({ username, registered: true }).end();
				});
		})
		.catch((err) => {
			logger.error(err, 'registerUser: Unhandled exception.');
			res.status(500).end();
		});
};
