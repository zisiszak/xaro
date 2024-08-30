export function toIntBool(value: boolean): IntBool {
	if (value === true) {
		return 1;
	}
	return 0;
}

export function parseIntBool(value: IntBool): boolean {
	if (value === 1) {
		return true;
	}
	return false;
}
