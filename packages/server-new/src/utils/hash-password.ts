import { createHash, randomBytes } from 'crypto';
import { newError } from 'exitus';
import { USER_PASSWORD_HASH_ALGORITHM } from '~/process/internal-params.js';

export interface HashedPassword {
	salt: string;
	hash: string;
}

/**
 * Pretty straightforward... it hashes passwords!
 *
 * @param password - Password to hash
 * @param saltLength - (optional) length of salt in bytes. Defaults to `16`
 * @returns - An object with the generated salt and hash.
 *
 * @throws {GenericError} If the salt length provided is not a positive, non-zero integer.
 */
export function hashPassword(password: string, saltLength: number = 16): HashedPassword {
	if (
		saltLength <= 0 ||
		Math.round(saltLength) !== saltLength ||
		isFinite(saltLength) === false
	) {
		throw newError({
			message: 'hashPassword: Salt length must be a positive, non-zero integer.',
		});
	}

	const salt = randomBytes(saltLength).toString('hex');

	return {
		salt,
		hash: createHash(USER_PASSWORD_HASH_ALGORITHM)
			.update(password + salt)
			.digest('hex'),
	};
}
