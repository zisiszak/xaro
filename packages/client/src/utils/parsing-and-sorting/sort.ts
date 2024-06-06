export const compareStrings = (a: string, b: string) => {
	if (a === b) {
		return 0;
	}

	if (a === '') {
		if (b === '') {
			return 0;
		}
		return -1;
	}

	if (b === '') {
		return 1;
	}

	let result: -1 | 0 | 1 = 0;

	for (let i = 0; i < a.length; i++) {
		const aChar = a[i]!;
		const bChar = b[i];
		if (!bChar) {
			result = 0;
			break;
		}
		if (aChar === bChar) {
			continue;
		}
		result = aChar.charCodeAt(0) > bChar.charCodeAt(0) ? 1 : -1;
		break;
	}

	return result;
};
