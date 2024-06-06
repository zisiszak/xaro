export const cleanInt = (value: unknown): number | undefined => {
	if (typeof value === 'number') {
		return Math.floor(value);
	}
	if (typeof value === 'string') {
		const parsed = parseInt(value, 10);
		if (
			isNaN(parsed) === false &&
			parsed !== Infinity &&
			parsed.toString() === value
		) {
			return parsed;
		}
	}
	return undefined;
};

export const pureIntElseOriginal = (
	input?: string | number | null,
): null | number | string | undefined => {
	if (typeof input === 'undefined' || input === null) {
		return input;
	}
	const asInt = cleanInt(input);
	if (typeof asInt === 'number' && asInt.toString() === input.toString()) {
		return asInt;
	}
	return input;
};

export const cleanString = (value: unknown): string | undefined => {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number') {
		return value.toString();
	}
	return undefined;
};

export const cleanStringArray = (value: unknown): string[] | undefined => {
	if (typeof value === 'string') {
		return [value];
	}
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === 'string');
	}
	return undefined;
};
