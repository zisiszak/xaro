import { type Guard } from 'is-guard';
import jsonWebToken from 'jsonwebtoken';
import { xaro } from '~/index.js';

const JWT_SECRET_MISSING_MESSAGE = 'JWT_SECRET environment variable not defined.';

/**
 *
 * @param data - Data to encode.
 * @param options - {@link jsonWebToken.SignOptions JWT sign options}.
 * @returns A `jsonwebtoken` string.
 *
 * @throws Fatal error if the `JWT_SECRET` environment variable is not defined.
 */
function encodeJwt(data: object, options?: jsonWebToken.SignOptions): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		xaro.exit(JWT_SECRET_MISSING_MESSAGE);
	}
	return jsonWebToken.sign(data, secret, options);
}

/**
 * @typeParam T - Expected payload type.
 * @param token - JWT token to decode.
 * @param typeguard - Typeguard function to validate payload.
 * @returns `T` on successful decode, otherwise `null`.
 *
 * @throws Fatal error if the `JWT_SECRET` environment variable is not defined.
 */
function decodeJwt<T>(token: unknown, typeguard: Guard<T>): T | null {
	if (typeof token !== 'string') {
		return null;
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		xaro.exit(JWT_SECRET_MISSING_MESSAGE);
	}

	const payload = jsonWebToken.verify(token, secret);
	if (!typeguard(payload)) {
		return null;
	}

	return payload;
}

export const jwt = {
	encode: encodeJwt,
	decode: decodeJwt,
};
