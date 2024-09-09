import { type RequestHandler } from 'express';
import { logger } from '~/index.js';
import { jwt } from '~/utils/json-web-token.js';
import {
	USER_ACCESS_TOKEN_COOKIE_KEY,
	USER_ACCESS_TOKEN_EXPIRY_TIME,
} from '../access-token/constants.js';
import { type UserAccessTokenPayload } from '../access-token/shared.js';
import {
	type PasswordValidationError,
	checkPasswordForValidationErrors,
} from '../user-password.js';
import { UserRoleEnum } from '../user-role.js';
import {
	type UsernameValidationError,
	checkUsernameForValidationErrors,
} from '../user-username.js';
import { User } from '../User.js';

export interface Status400_InvalidInput {
	usernameValidationError: UsernameValidationError | null;
	passwordValidationError: PasswordValidationError | null;
}
export interface Status409_UsernameTaken {}
export interface Status500_UnexpectedError {}
export interface Status201_UserCreated {
	username: string;
	userID: number;
}

export type ResponseBody =
	| Status201_UserCreated
	| Status500_UnexpectedError
	| Status409_UsernameTaken
	| Status400_InvalidInput;

export const userRegistrationController: RequestHandler<never, ResponseBody> = async (req, res) => {
	const { username, password } = req.basicAuth!;

	const usernameValidationError = checkUsernameForValidationErrors(username) ?? null;
	const passwordValidationError = password
		? (checkPasswordForValidationErrors(password) ?? null)
		: null;

	if (usernameValidationError !== null || passwordValidationError !== null)
		return void res
			.status(400)
			.json({
				passwordValidation: passwordValidationError,
				usernameValidation: usernameValidationError,
			})
			.end();

	if (await User.isUsernameTaken(username)) return void res.status(409).end();

	try {
		await User.addUser(username, password, UserRoleEnum.Standard);

		const accessTokenPayload = (await User.authenticateUserCredentials(
			username,
			password,
		)) as UserAccessTokenPayload;

		res.status(201)
			.cookie(USER_ACCESS_TOKEN_COOKIE_KEY, jwt.encode(accessTokenPayload), {
				httpOnly: true,
				maxAge: USER_ACCESS_TOKEN_EXPIRY_TIME,
			})
			.json({ userID: accessTokenPayload.userID, username: accessTokenPayload.username })
			.end();
	} catch (err) {
		logger.error(err);
		res.status(500).end();
	}
};
