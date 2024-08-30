import { createGuard, is } from 'is-guard';
import { generateHashFromString, generateSalt } from '~/utils/hash-string.js';

export const PASSWORD_HASH_ALGORITHM = 'sha256';
export const PASSWORD_SALT_LENGTH = 16;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;
const VALID_PASSWORD_EXP = /([^A-z\d~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/\ ])/g;

const USER_AUTHENTICATION_SYM = Symbol();

export const USER_ACCESS_TOKEN_KEY = 'user_access_token';
/** In milliseconds, relative to time first signed */
export const USER_ACCESS_TOKEN_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7;

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 24;
const VALID_USERNAME_EXP = /[^A-z\d\-_.]/g;

export const userRoles = ['standard', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];
export const isUserRole = (value: unknown): value is UserRole =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	userRoles.includes(value as any);
export function assertIsUserRole(value: UserRole): asserts value is UserRole {
	if (!isUserRole(value)) throw 'BAD: user role';
}

export interface UserAccessTokenPayload {
	id: number;
	username: string;
	role: UserRole;
	expiry: number;
}
export const isUserAccessTokenPayload = createGuard.objectWithProps<UserAccessTokenPayload>({
	// jwt includes a few of its own properties, so we need to allow extra keys
	noExtraKeys: false,
	required: {
		id: is.number,
		username: is.string,
		role: isUserRole,
		expiry: is.number,
	},
});

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

export interface UsernameValidationError {
	invalidLength: 'too_long' | 'too_short' | null;
	invalidChars: string | null;
}
export const validateUsernameString = (username: string): undefined | UsernameValidationError => {
	const length = username.length;
	const invalidLength =
		length > MAX_USERNAME_LENGTH
			? 'too_long'
			: length < MIN_USERNAME_LENGTH
				? 'too_short'
				: null;
	const invalidCharsArray = VALID_USERNAME_EXP.exec(username);

	if (invalidCharsArray !== null || invalidLength !== null) {
		return {
			invalidChars: invalidCharsArray
				? Array.from(new Set(invalidCharsArray)).join('')
				: null,
			invalidLength: invalidLength,
		};
	}

	return undefined;
};
export function assertIsValidUsernameString(username: string): asserts username is string {
	const length = username.length;
	if (
		length > MAX_USERNAME_LENGTH ||
		length < MIN_USERNAME_LENGTH ||
		VALID_USERNAME_EXP.test(username)
	)
		throw 'BAD: username';
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

// export function convertHashToUserAuthentication(
// 	hash: string | null,
// 	salt: string | null,
// ): UserAuthentication | undefined;
// export function convertHashToUserAuthentication(hash: null, salt: null): undefined;
// export function convertHashToUserAuthentication(hash: string, salt: null): never;
// export function convertHashToUserAuthentication(hash: null, salt: string): never;
// export function convertHashToUserAuthentication(hash: string, salt: string): UserAuthentication;
// export function convertHashToUserAuthentication(hash: string | null, salt: string | null) {
// 	if (hash !== null) {
// 		if (salt === null) throw 'BAD: salt cannot be null if hash is a string.';
// 		return newUserAuthentication(hash, salt);
// 	}
// 	if (salt !== null) throw 'BAD: hash cannot be null if salt is a string.';
// 	return undefined;
// }

export const generateUserAuthentication = (
	password: string | undefined,
):
	| {
			passwordHash: null;
			passwordSalt: null;
	  }
	| {
			passwordHash: string;
			passwordSalt: string;
	  } => {
	if (!password) return { passwordHash: null, passwordSalt: null };

	assertIsValidPasswordString(password);

	const passwordSalt = generateSalt(PASSWORD_SALT_LENGTH);
	const passwordHash = hashPassword(password, passwordSalt);

	return { passwordHash, passwordSalt };
};

// function newUserAuthentication(hash: string, salt: string): UserAuthentication {
// 	return Object.freeze({
// 		[USER_AUTHENTICATION_SYM]: true as const,
// 		hash,
// 		salt,
// 	});
// }
