import { type Guard } from 'is-guard';
import jwt from 'jsonwebtoken';
import { quit } from '../../index.js';

const JWT_SECRET_MISSING = 'JWT_SECRET environment variable not defined.';

/**
 *
 * @param data - Data to encode.
 * @param options - {@link jwt.SignOptions JWT sign options}.
 * @returns A `jsonwebtoken` string.
 *
 * @throws Fatal error {@link JWT_SECRET_MISSING} if the `JWT_SECRET` environment variable is not defined.
 */
export function encodeJWT(data: object, options?: jwt.SignOptions): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		quit({
			kind: 'fatal',
			log: {
				msg: JWT_SECRET_MISSING,
			},
		});
		process.exit(1);
	}
	return jwt.sign(data, secret, options);
}

/**
 * @typeParam T - Expected payload type.
 * @param token - JWT token to decode.
 * @param typeguard - Typeguard function to validate payload.
 * @returns `T` on successful decode, otherwise `null`.
 *
 * @throws Fatal error {@link JWT_SECRET_MISSING} if the `JWT_SECRET` environment variable is not defined.
 */
export function decodeJWT<T>(
	token: unknown,
	typeguard: Guard<T>,
): T | null {
	if (typeof token !== 'string') {
		return null;
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		quit({
			kind: 'fatal',
			log: {
				msg: JWT_SECRET_MISSING,
			},
		});
		process.exit(1);
	}

	const payload = jwt.verify(token, secret);
	if (!typeguard(payload)) {
		return null;
	}

	return payload;
}
