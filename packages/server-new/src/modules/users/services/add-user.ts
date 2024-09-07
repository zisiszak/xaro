import { repository } from '~/modules/repositories.js';
import { assertValidPassword, generatePasswordSalt, hashPassword } from '../model/user-password.js';
import { assertUserRole, type UserRole } from '../model/user-role.js';
import { assertValidUsername } from '../model/user-username.js';

/** returns the newly created `userID` */
export const addUser = async (
	username: string,
	password: string | undefined,
	role: UserRole,
): Promise<number> => {
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
};
