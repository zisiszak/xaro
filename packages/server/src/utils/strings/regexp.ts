/**
 *
 * @param value - Value to check if it is a valid regular expression string
 * @returns A new `RegExp` if the value is a valid regular expression string. `null` if not.
 */
export function parseRegExp(regExpString: string) {
	let exp: RegExp;
	try {
		exp = new RegExp(regExpString);
	} catch (err) {
		return null;
	}
	return exp;
}
