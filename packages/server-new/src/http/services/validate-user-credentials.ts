import { createHash } from 'crypto';
import { Users } from '~/models/database/tables/index.js';
import { USER_PASSWORD_HASH_ALGORITHM } from '~/process/internal-params.js';

/**
 *
 * @returns `null` if the username doesn't exist. `false` if the password is incorrect. `UserAccessTokenPayload` without expiry on success.
 */
export async function validateUserCredentials({
	username,
	password,
}: {
	username: string;
	password?: string;
}): Promise<Pick<Users.Selection, 'id' | 'username' | 'role'> | null | false> {
	const credentials = await Users.readEntryCredentialsWhereUsername(username);
	if (!credentials) return null;

	const { password_hash: hash, password_salt: salt, id, role } = credentials;

	if (
		(hash === null && salt === null && !password) ||
		(hash !== null &&
			salt !== null &&
			password &&
			createHash(USER_PASSWORD_HASH_ALGORITHM)
				.update(password + salt)
				.digest('hex') === hash)
	) {
		return {
			id,
			username,
			role,
		};
	}

	return false;
}
