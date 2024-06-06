export const repeatingSubstrExp = (escapedSubstring: string) =>
	new RegExp(`(${escapedSubstring})+`, 'g');

export const REPEATING_HYPHENS = repeatingSubstrExp(`\\-`);
