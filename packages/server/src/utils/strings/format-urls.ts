import { URL } from 'url';
import { toAlphanumericKebabCase } from './exps/alphanumeric-kebab-case.js';
import { URL_CHARS_REQUIRING_ESCAPING, URL_PROTOCOL } from './exps/url.js';
import { parseRegExp } from './regexp.js';

export function urlToRegExp(url: URL): RegExp {
	const expString = `(?<=(^|\\/\\/|\\.))${url.origin.replace(URL_PROTOCOL, '').replace(URL_CHARS_REQUIRING_ESCAPING, (s) => `\\${s}`)}(?=($|(\\/|\\?)(.+)?))`;
	const exp = parseRegExp(expString);
	if (exp === null) {
		throw {
			reason: 'Valid RegExp string could not be created from URL.',
			debug: {
				url: url,
				urlOrigin: url.origin,
				createdExpString: expString,
			},
		};
	}
	return exp;
}

export function isUrl(input: unknown): input is string {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		new URL(input as any);
	} catch (err) {
		return false;
	}
	return true;
}

export function removeProtocolFromUrlString(urlString: string) {
	return urlString.replace(URL_PROTOCOL, '');
}

export function generateOriginUniqueNameFromUrl(url: URL) {
	return toAlphanumericKebabCase(removeProtocolFromUrlString(url.origin));
}

export function cleanUrlString(urlString: string): string | undefined {
	try {
		return new URL(urlString).href.split('#')[0]!;
	} catch (err) {
		return undefined;
	}
}
