const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 24;
const VALID_USERNAME_EXP = /[^A-z\d\-_.]/g;

export interface UsernameValidationError {
	invalidLength: 'too_long' | 'too_short' | null;
	invalidChars: string | null;
}
export function validateUsernameString(username: string): undefined | UsernameValidationError {
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
}

export function assertIsValidUsernameString(username: string): asserts username is string {
	const length = username.length;
	if (
		length > MAX_USERNAME_LENGTH ||
		length < MIN_USERNAME_LENGTH ||
		VALID_USERNAME_EXP.test(username)
	)
		throw 'BAD: username';
}
