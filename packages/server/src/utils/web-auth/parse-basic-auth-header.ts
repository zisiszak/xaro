import { type IncomingHttpHeaders } from 'http2';

export type ParsedBasicAuthHeader = {
	username: string;
	password?: string;
};
/**
 * @description Parses the `authorization` header using the `'Basic'` authorization scheme.
 * @param incomingHttpHeaders - IncomingHttpHeaders to be parsed.
 * @returns A {@link ParsedBasicAuthHeader} on successful parsing. Otherwise, `undefined` if authorization header is missing, or `null` if auth-scheme is not `'Basic'` or if auth-params contain a syntax error.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme, Basic Authentication Reference (MDN)}
 */
export function parseBasicAuthHeader(
	incomingHttpHeaders: IncomingHttpHeaders,
): ParsedBasicAuthHeader | null | undefined {
	const { authorization } = incomingHttpHeaders;

	if (!authorization) {
		return undefined;
	}

	const [scheme, params] = authorization.split(' ');
	if (scheme !== 'Basic' || !params) {
		return null;
	}

	const credentials = Buffer.from(params, 'base64').toString('utf-8');
	const [username, password] = credentials.split(':');
	if (!username) {
		return null;
	}

	return { username, password };
}
