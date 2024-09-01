import { generateHashFromString, generateSalt } from '~/utils/hash-string.js';

const PASSWORD_HASHING_ALGORITHM: string = 'sha256';
const GENERATED_SALT_LENGTH: number = 16;
export const MIN_PASSWORD_LENGTH: number = 8;
export const MAX_PASSWORD_LENGTH: number = 64;
const INVALID_PASSWORD_CHARS_EXP: RegExp = /([^A-z\d~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/\ ])/g;

export interface PasswordValidationError {
	invalid_length: 'too_long' | 'too_short' | null;
	invalid_chars: string | null;
}
export const checkPasswordForValidationErrors = (
	password: string,
): undefined | PasswordValidationError => {
	const length = password.length;
	const invalidLength =
		length > MAX_PASSWORD_LENGTH
			? 'too_long'
			: length < MIN_PASSWORD_LENGTH
				? 'too_short'
				: null;
	const invalidCharsArray = password.matchAll(INVALID_PASSWORD_CHARS_EXP);

	if (invalidLength !== null || invalidCharsArray !== null) {
		return {
			invalid_chars: invalidCharsArray
				? Array.from(new Set(invalidCharsArray)).join('')
				: null,
			invalid_length: invalidLength,
		};
	}

	return undefined;
};

export function assertValidPassword(password: string): asserts password is string {
	const length = password.length;
	if (
		length > MAX_PASSWORD_LENGTH ||
		length < MIN_PASSWORD_LENGTH ||
		INVALID_PASSWORD_CHARS_EXP.test(password)
	)
		throw 'invalid password';
}

export const generatePasswordSalt = (): string => generateSalt(GENERATED_SALT_LENGTH);

export const hashPassword = (password: string, salt: string): string =>
	generateHashFromString(password + salt, PASSWORD_HASHING_ALGORITHM);
