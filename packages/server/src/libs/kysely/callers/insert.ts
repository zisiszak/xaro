import { type InsertQueryBuilder, type InsertResult } from 'kysely';

// TYPES

export type InsertCaller<Result> = <
	DB,
	TB extends keyof DB,
	O extends InsertResult,
>(
	qb: InsertQueryBuilder<DB, TB, O>,
) => Result;

type InsertCallersMap = typeof $callInsert;
export type InsertMode = keyof InsertCallersMap;
export type InsertCallersReturnMap = {
	[K in keyof InsertCallersMap]: ReturnType<InsertCallersMap[K]>;
};

// FUNCTIONS

/**
 * ### Kysely Insertion Caller
 *
 * Executes an insertion for the `InsertQueryBuilder` provided. Does not throw on conflict errors, but does not handle other exceptions.
 *
 * - If the table being inserted to has a primary key defined, a successful insertion will result in a `number` being returned, representing the id of the newly inserted row.
 * - If the table being inserted to does not have a primary key defined, a successful insertion will return `undefined`.
 * - If a conflict is encountered, `null` is returned.
 *
 * - **Important**: Does not catch any exceptions.
 *
 * @param queryBuilder - Query Builder instance.
 */
export const insertOnConflictDoNothing: InsertCaller<
	Promise<number | null | undefined>
> = (queryBuilder) =>
	queryBuilder
		.onConflict((oc) => oc.doNothing())
		.executeTakeFirst()
		.then((result) =>
			typeof result === 'undefined'
				? null
				: typeof result.insertId === 'undefined'
					? undefined
					: Number(result.insertId),
		);

/**
 * ### Kysely Insertion Caller
 * Executes an insertion for the `InsertQueryBuilder` provided.
 *
 * - If the table being inserted to has a primary key defined, a successful insertion will result in a `number` being returned, representing the id of the newly inserted row.
 * - If the table being inserted to does not have a primary key defined, a successful insertion will return `undefined`.
 * - If a conflict error occurs, an error is thrown.
 *
 * - **Important**: Does not catch any exceptions.
 *
 * @param queryBuilder - Query Builder instance.
 */
export const insertOnConflictThrow: InsertCaller<
	Promise<number | undefined>
> = (queryBuilder) =>
	queryBuilder
		.executeTakeFirstOrThrow()
		.then((result) =>
			typeof result.insertId === 'undefined'
				? undefined
				: Number(result.insertId),
		);

// INDEX
/**
 * ### Object
 */
export const $callInsert = {
	onConflictDoNothing: insertOnConflictDoNothing,
	onConflictThrow: insertOnConflictThrow,
};
