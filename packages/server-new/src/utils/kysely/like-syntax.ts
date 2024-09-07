import { exerr } from 'exitus';

const percentExp = /%/g;
const underscoreExp = /_/g;
const percentOrUndescoreExp = /_|%/g;
// dammnit this won't work with kysely unless i use sql.lit, which doesn't seem like the best idea...
export const sqlLIKE = (
	str: string,
	start: '%' | '_' = '%',
	end: '%' | '_' = '%',
	escape: boolean = true,
) => {
	if (typeof start === 'undefined' && typeof end === 'undefined') {
		throw exerr({
			message:
				'A LIKE pattern must include a wildcard character. No start or end wildcard was provided.',
			context: {
				str,
				escape,
			},
		});
	}

	let string: string = str;
	if (escape) {
		let escapePercent = false;
		let escapeUnderscore = false;
		if (start === '%' || end === '%') {
			escapePercent = true;
		}
		if (start === '_' || end === '_') {
			escapeUnderscore = true;
		}

		string = str.replace(
			escapePercent && escapeUnderscore
				? percentOrUndescoreExp
				: escapePercent
					? percentExp
					: underscoreExp,
			(c) => `\\${c}`,
		);
	}

	return `LIKE ${start ?? ''}${string}${end ?? ''}${escape ? ` ESCAPE '\\'` : ''}`;
};
