import { type SelectQueryBuilder } from 'kysely';
import { type SimplifySingleResult } from '../types.js';

// TYPES

// TODO: This needs to be changed, since select is a lot more complex compared to insert
export type SelectCaller<Result> = <DB, TB extends keyof DB, O>(
	qb: SelectQueryBuilder<DB, TB, O>,
) => Result;

type SelectCallersMap = typeof $callSelect;
export type SelectMode = keyof SelectCallersMap;
export type SelectCallersReturnMap = {
	[K in keyof SelectCallersMap]: ReturnType<SelectCallersMap[K]>;
};

// FUNCTIONS

export const selectFirst = <DB, TB extends keyof DB, O>(
	queryBuilder: SelectQueryBuilder<DB, TB, O>,
) =>
	queryBuilder.executeTakeFirst().then((result) => {
		if (typeof result === 'undefined') return undefined;
		return result as SimplifySingleResult<O>;
	});

// INDEX

export const $callSelect = {
	first: selectFirst,
} as const;
