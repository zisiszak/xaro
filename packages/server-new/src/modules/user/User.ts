import { logger } from '~/index.js';
import { repository } from '../index.repositories.js';
import {
	USER_ACCESS_TOKEN_EXPIRY_TIME,
	type UserAccessTokenPayload,
} from './access-token/index.js';
import { type AboutUser } from './model.js';
import { userRepository } from './sqlite.repository.js';
import { assertValidPassword, generatePasswordSalt, hashPassword } from './user-password.js';
import { assertUserRole, type UserRole } from './user-role.js';
import { assertValidUsername } from './user-username.js';

export class User {
	static async authenticateUserCredentials(
		username: string,
		password: string | undefined,
	): Promise<UserAccessTokenPayload | undefined | false> {
		const user = await userRepository.findByUsername(username);
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
	}

	static async getAboutUser(userID: number): Promise<AboutUser | undefined> {
		const user = await userRepository.findByID(userID);

		if (!user) {
			logger.error(
				`Could not get user info for user id: ${userID} - ID not found in database.`,
			);
			return undefined;
		}
		const { passwordHash, passwordSalt, ...rest } = user;

		return { ...rest, usesAuthentication: passwordHash !== null && passwordSalt !== null };
	}

	/** returns the newly created `userID` */
	static async addUser(
		username: string,
		password: string | undefined,
		role: UserRole,
	): Promise<number> {
		assertValidUsername(username);
		assertUserRole(role);

		let passwordHash: string | null;
		let passwordSalt: string | null;
		if (typeof password !== 'undefined') {
			assertValidPassword(password);

			passwordSalt = generatePasswordSalt();
			passwordHash = hashPassword(password, passwordSalt);
		} else {
			passwordHash = null;
			passwordSalt = null;
		}

		return repository.User.save({
			passwordHash,
			passwordSalt,
			username,
			role,
		});
	}

	static isUsernameTaken = userRepository.isUsernameTaken;
}
