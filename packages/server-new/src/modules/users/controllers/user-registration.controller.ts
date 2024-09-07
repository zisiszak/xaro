import { type RequestHandler } from 'express';
import { logger } from '~/index.js';
import { jwt } from '~/utils/json-web-token.js';
import {
	USER_ACCESS_TOKEN_EXPIRY_TIME,
	USER_ACCESS_TOKEN_KEY,
	type UserAccessTokenPayload,
} from '../model/user-access-token.js';
import {
	checkPasswordForValidationErrors,
	type PasswordValidationError,
} from '../model/user-password.js';
import { UserRoleEnum } from '../model/user-role.js';
import {
	checkUsernameForValidationErrors,
	type UsernameValidationError,
} from '../model/user-username.js';
import { addUser } from '../services/add-user.js';
import { authenticateUserCredentials } from '../services/authenticate-user-credentials.js';
import { isUsernameTaken } from '../services/is-username-taken.js';

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

	if (await isUsernameTaken(username)) return void res.status(409).end();

	try {
		await addUser(username, password, UserRoleEnum.Standard);

		const accessTokenPayload = (await authenticateUserCredentials(
			username,
			password,
		)) as UserAccessTokenPayload;

		res.status(201)
			.cookie(USER_ACCESS_TOKEN_KEY, jwt.encode(accessTokenPayload), {
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
