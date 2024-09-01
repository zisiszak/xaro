import { repository } from '~/modules/repositories.js';
import {
	USER_ACCESS_TOKEN_EXPIRY_TIME,
	type UserAccessTokenPayload,
} from '../model/user-access-token.js';
import { hashPassword } from '../model/user-password.js';

export const authenticateUserCredentials = async (
	username: string,
	password: string | undefined,
): Promise<UserAccessTokenPayload | undefined | false> => {
	const user = await repository.User.findByUsername(username);
	if (!user) return undefined;

	const authenticated =
		user.passwordHash !== null && user.passwordSalt !== null
			? password && user.passwordHash === hashPassword(password, user.passwordSalt)
			: !password;

	if (!authenticated) return false;

	return {
		userID: user.id,
		role: user.role,
		username: user.username,
		expiry: Date.now() + USER_ACCESS_TOKEN_EXPIRY_TIME,
	};
};
