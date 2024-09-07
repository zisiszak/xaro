import { createHash, randomBytes } from 'crypto';

export function generateSalt(length: number = 16): string {
	if (length <= 0 || Math.round(length) !== length || !isFinite(length))
		throw 'salt length must be a positive, non-zero integer.';
	return randomBytes(length).toString('hex');
}

/**
 * Pretty straightforward... it hashes passwords!
 *
 * @param string - Password to hash
 * @param algorithm - `node:crypto` hash algorithm to use
 * @returns - An object with the generated salt and hash.
 */
export function hashString(string: string, algorithm: string): string {
	return createHash(algorithm).update(string).digest('hex');
}
