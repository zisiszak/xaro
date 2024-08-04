export function cleanString(value: unknown): string | undefined {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number') {
		return value.toString();
	}
	return undefined;
}

export function cleanInt(value: unknown): number | undefined {
	if (typeof value === 'number') {
		return Math.floor(value);
	}
	if (typeof value === 'string') {
		const parsed = parseInt(value, 10);
		if (isNaN(parsed) === false && parsed !== Infinity && parsed.toString() === value) {
			return parsed;
		}
	}
	return undefined;
}
