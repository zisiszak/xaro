import { REPEATING_HYPHENS } from './repeating-chars.js';

export const ALPHANUMERIC_KEBAB_CASE = /^[a-z0-9\-]+$/;
export const NOT_ALPHANUMERIC_KEBAB_CASE_CHARS = /[^a-z0-9\-]/g;

export function toAlphanumericKebabCase(s: string) {
	return s
		.toLowerCase()
		.replaceAll(NOT_ALPHANUMERIC_KEBAB_CASE_CHARS, '-')
		.replaceAll(REPEATING_HYPHENS, '-');
}
