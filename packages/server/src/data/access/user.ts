import { createHash } from 'crypto';
import { __coreParams } from '~/config/core-params.js';
import { type UserAccessTokenPayload } from '~/exports.js';
import { db } from '~/index.js';
import { $callSelect } from '~/libs/kysely/index.js';
import { type User } from '../model/tables/index.js';

export interface UserCoreParamsErrors {
	passwordHashMissing?: true;
	passwordSaltMissing?: true;
	usernameViolatesCoreParams?: true;
}
export function checkForUserCoreParamsErrors(
	user: User.Selection,
): UserCoreParamsErrors {
	const errors: UserCoreParamsErrors = {};
	if (user.passwordHash && !user.passwordSalt) {
		errors.passwordSaltMissing = true;
	} else if (!user.passwordHash && user.passwordSalt) {
		errors.passwordHashMissing = true;
	}
	if (user.username.length < __coreParams.userMinUsernameLength) {
		errors.usernameViolatesCoreParams = true;
	}
	return errors;
}

export async function validateUserAccessCredentials({
	username,
	password,
}: {
	username: string;
	password?: string;
}): Promise<
	Omit<UserAccessTokenPayload, 'expiry'> | 'USER_NOT_FOUND' | 'UNAUTHORISED'
> {
	return db
		.selectFrom('User')
		.select([
			'User.passwordHash',
			'User.passwordSalt',
			'User.role',
			'User.username',
			'User.id',
		])
		.where('username', '=', username)
		.$call($callSelect.first)
		.then((authData) => {
			if (typeof authData === 'undefined') {
				return 'USER_NOT_FOUND' as const;
			}

			const { passwordHash, passwordSalt, id, username, role } = authData;

			let authorised: boolean = false;
			if (passwordHash === null && passwordSalt === null && !password) {
				authorised = true;
			} else if (
				passwordHash !== null &&
				passwordSalt !== null &&
				password
			) {
				if (
					createHash(__coreParams.userPasswordHashAlgorithm)
						.update(password + passwordSalt)
						.digest('hex') === passwordHash
				) {
					authorised = true;
				}
			}

			if (authorised === false) {
				return 'UNAUTHORISED' as const;
			}

			return {
				id: id,
				username: username,
				role: role,
			};
		});
}
