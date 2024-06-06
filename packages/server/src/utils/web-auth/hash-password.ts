import { createHash, randomBytes } from 'crypto';

export type HashedPasswordResult = {
	salt: string;
	hash: string;
};

/**
 * Pretty straightforward... it hashes passwords!
 *
 * @param password - Password to hash
 * @param saltLength - (optional) length of salt in bytes. Defaults to `16`
 * @returns - An object with the generated salt and hash.
 *
 * @throws {Error} If `password === ''` or if the salt length provided is not a positive, non-zero integer.
 */
export function hashPassword(
	password: string,
	saltLength: number = 16,
): HashedPasswordResult {
	if (password === '') {
		throw new Error('hashPassword: I refuse to hash an empty string!');
	}
	if (
		saltLength <= 0 ||
		Math.round(saltLength) !== saltLength ||
		isFinite(saltLength) === false
	) {
		throw new Error(
			'hashPassword: Salt length must be a positive, non-zero integer.',
		);
	}

	const salt = randomBytes(saltLength).toString('hex');
	const hasher = createHash('sha256');
	hasher.update(password + salt);
	return {
		salt,
		hash: hasher.digest('hex'),
	};
}
