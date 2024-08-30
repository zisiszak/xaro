import { generateHashFromString, generateSalt } from '~/utils/hash-string.js';

const PASSWORD_HASH_ALGORITHM = 'sha256';
const PASSWORD_SALT_LENGTH = 16;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;
const VALID_PASSWORD_EXP = /([^A-z\d~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/\ ])/g;

const USER_AUTHENTICATION_SYM = Symbol();

export type UserAuthentication = Readonly<{
	[USER_AUTHENTICATION_SYM]: true;
	salt: string;
	hash: string;
}>;

export interface PasswordValidationError {
	invalid_length: 'too_long' | 'too_short' | null;
	invalid_chars: string | null;
}
export const validatePasswordString = (password: string): undefined | PasswordValidationError => {
	const length = password.length;
	const invalidLength =
		length > MAX_PASSWORD_LENGTH
			? 'too_long'
			: length < MIN_PASSWORD_LENGTH
				? 'too_short'
				: null;
	const invalidCharsArray = VALID_PASSWORD_EXP.exec(password);

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

export function assertIsValidPasswordString(password: string): asserts password is string {
	const length = password.length;
	if (
		length > MAX_PASSWORD_LENGTH ||
		length < MIN_PASSWORD_LENGTH ||
		VALID_PASSWORD_EXP.test(password)
	)
		throw 'BAD: user password';
}

export function assertIsUserAuthentication(value: unknown): asserts value is UserAuthentication {
	if (
		typeof value !== 'object' ||
		value === null ||
		(value as any)[USER_AUTHENTICATION_SYM] !== null
	)
		throw 'BAD: user authentication';
}

export const hashPassword = (password: string, salt: string): string =>
	generateHashFromString(password + salt, PASSWORD_HASH_ALGORITHM);

export function convertHashToUserAuthentication(
	hash: string | null,
	salt: string | null,
): UserAuthentication | undefined;
export function convertHashToUserAuthentication(hash: null, salt: null): undefined;
export function convertHashToUserAuthentication(hash: string, salt: null): never;
export function convertHashToUserAuthentication(hash: null, salt: string): never;
export function convertHashToUserAuthentication(hash: string, salt: string): UserAuthentication;
export function convertHashToUserAuthentication(hash: string | null, salt: string | null) {
	if (hash !== null) {
		if (salt === null) throw 'BAD: salt cannot be null if hash is a string.';
		return newUserAuthentication(hash, salt);
	}
	if (salt !== null) throw 'BAD: hash cannot be null if salt is a string.';
	return undefined;
}

export const generateUserAuthentication = (password: string): UserAuthentication => {
	assertIsValidPasswordString(password);

	const salt = generateSalt(PASSWORD_SALT_LENGTH);
	const hash = hashPassword(password, salt);

	return newUserAuthentication(hash, salt);
};

function newUserAuthentication(hash: string, salt: string): UserAuthentication {
	return Object.freeze({
		[USER_AUTHENTICATION_SYM]: true as const,
		hash,
		salt,
	});
}
