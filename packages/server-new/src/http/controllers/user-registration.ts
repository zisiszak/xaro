import { type RequestHandler } from 'express';
import { xaro } from '~/index.js';
import {
	generateUserAuthentication,
	type PasswordValidationError,
	type UsernameValidationError,
	userRepository,
	validatePasswordString,
	validateUsernameString,
} from '~/modules/users/index.js';

interface InvalidInputResponse {
	error: 'invalid_input';
	info: {
		usernameValidation: UsernameValidationError | null;
		passwordValidation: PasswordValidationError | null;
	};
}
interface UsernameTakenResponse {
	error: 'username_already_exists';
}
interface UnexpectedErrorResponse {
	error: 'unexpected';
}
interface SuccessResponse {
	username: string;
	userID: number;
}

export const UserRegistrationController: RequestHandler<
	never,
	InvalidInputResponse | UnexpectedErrorResponse | UsernameTakenResponse | SuccessResponse
> = async (req, res) => {
	const { username, password } = req.basicAuth!;

	const usernameValidationError = validateUsernameString(username) ?? null;
	const passwordValidationError =
		typeof password === 'undefined' ? null : (validatePasswordString(password) ?? null);

	if (usernameValidationError !== null || passwordValidationError !== null)
		return void res
			.status(400)
			.json({
				error: 'invalid_input',
				info: {
					passwordValidation: passwordValidationError,
					usernameValidation: usernameValidationError,
				},
			})
			.end();

	if (await userRepository.isUsernameTaken(username))
		return void res
			.status(409)
			.json({
				error: 'username_already_exists',
			})
			.end();

	const userAuthentication = generateUserAuthentication(password);

	await userRepository
		.save({
			username,
			role: 'standard',
			...userAuthentication,
		})
		.then(
			(userID) =>
				void res
					.status(201)
					.json({
						userID,
						username,
					})
					.end(),
		)

		.catch((err) => {
			xaro.log.error(err);
			res.status(500)
				.json({
					error: 'unexpected',
				})
				.end();
		});
};
