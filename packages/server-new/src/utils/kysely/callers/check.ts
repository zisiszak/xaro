import { type SelectQueryBuilder } from 'kysely';

/**
 *
 * @param qb - Query builder
 * @returns `true` if at least one result is found for the given query, or `false` if no results are found
 *
 * @throws {Error}
 * Throws on database query error
 */
export async function checkAnyExist<DB, TB extends keyof DB, O>(qb: SelectQueryBuilder<DB, TB, O>) {
	return qb.executeTakeFirst().then((result) => result !== undefined);
}

/**
 *
 * @param qb - Query builder
 * @returns `true` if only one result is found, `false` if more than one result is found, or `undefined` if no results are found.
 */
export async function checkOnlyOneExists<DB, TB extends keyof DB, O>(
	qb: SelectQueryBuilder<DB, TB, O>,
) {
	return qb
		.limit(2)
		.execute()
		.then((result) => (result.length === 1 ? true : result.length === 2 ? false : undefined));
}

export const $callCheck = {
	anyExist: checkAnyExist,
	onlyOneExists: checkOnlyOneExists,
} as const;
export type CheckMode = keyof typeof $callCheck;
