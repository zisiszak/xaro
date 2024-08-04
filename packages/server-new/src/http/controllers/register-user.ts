import { type RequestHandler } from 'express';
import { Users } from '~/models/database/tables/index.js';
import {
	PASSWORD_MIN_LENGTH,
	USER_PASSWORD_REQUIRED,
	USERNAME_MIN_LENGTH,
} from '~/process/index.js';

interface InvalidInputResponse {
	reason: 'invalid-inputs';
	feedback: {
		username: {
			missing?: boolean;
			too_short?: boolean;
			// invalid_chars?: boolean;
		};
		password: {
			missing?: boolean;
			too_short?: boolean;
			// invalid_chars?: boolean;
		};
	};
}
interface UsernameTakenResponse {
	reason: 'username-taken';
}
interface UnexpectedErrorResponse {
	reason: 'unexpected';
}
interface SuccessResponse {
	username: string;
	user_id: number;
}

export const RegisterUserController: RequestHandler<
	never,
	InvalidInputResponse | UnexpectedErrorResponse | UsernameTakenResponse | SuccessResponse
> = async (req, res) => {
	const { username, password } = req.basicAuth!;

	const usernameInputFeedback: NonNullable<InvalidInputResponse['feedback']>['username'] = {};
	const passwordInputFeedback: NonNullable<InvalidInputResponse['feedback']>['password'] = {};

	if (!username) usernameInputFeedback.missing = true;
	if (username.length < USERNAME_MIN_LENGTH) usernameInputFeedback.too_short = true;
	if (USER_PASSWORD_REQUIRED && !password) passwordInputFeedback.missing = true;
	if (password && password.length < PASSWORD_MIN_LENGTH) passwordInputFeedback.too_short = true;

	if (
		Object.keys(usernameInputFeedback).length > 0 ||
		Object.keys(passwordInputFeedback).length > 0
	) {
		res.status(400)
			.json({
				reason: 'invalid-inputs',
				feedback: {
					username: usernameInputFeedback,
					password: passwordInputFeedback,
				},
			})
			.end();
		return;
	}

	if (await Users.checkIfUsernameTaken(username)) {
		res.status(409).json({ reason: 'username-taken' }).end();
		return;
	}

	const [err, userID] = await Users.insert({
		username: username,
		role: Users.UserRoleEnum.standard,
		password,
	});
	if (err) {
		res.status(500)
			.send({
				reason: 'unexpected',
			})
			.end();
		return;
	}

	res.status(201)
		.json({
			user_id: userID,
			username: username,
		})
		.end();
};
