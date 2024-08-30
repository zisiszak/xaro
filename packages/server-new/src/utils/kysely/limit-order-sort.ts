import type { ReferenceExpression, SelectQueryBuilder } from 'kysely';
import { type AnyTable, type DatabaseSchema } from '~/modules/database.schema.js';
import { cleanInt, cleanString } from '../sanitise.js';

export type LimitOrderSort<
	Table extends AnyTable,
	OrderBy extends ReferenceExpression<DatabaseSchema, Table> = ReferenceExpression<
		DatabaseSchema,
		Table
	>,
> = {
	limit?: number;
	direction?: 'asc' | 'desc';
	offset?: number;
	orderBy?: OrderBy;
};

export type LimitOrderSortReqQueryParams<
	TB extends keyof DatabaseSchema,
	OrderBy extends ReferenceExpression<DatabaseSchema, TB> = ReferenceExpression<
		DatabaseSchema,
		TB
	>,
> = LimitOrderSort<TB, OrderBy> & {
	LIMIT?: number;
	OFFSET?: number;
	DIRECTION?: 'asc' | 'desc';
	ORDER_BY?: OrderBy;
};

export interface GenericLimitOrderSortReqQueryParams {
	limit?: unknown;
	LIMIT?: unknown;
	offset?: unknown;
	OFFSET?: unknown;
	direction?: unknown;
	DIRECTION?: unknown;
	orderBy?: unknown;
	ORDER_BY?: unknown;
}

export type ParseLimitOrderSortOptions<TB extends keyof DatabaseSchema> = {
	defaultLimit?: number;
	maxLimit?: number;
	defaultOrderBy?: ReferenceExpression<DatabaseSchema, TB>;
	/**
	 * Of particular importance if the query is user-generated.
	 */
	allowUnmappedOrderReferences?: boolean;
	orderReferenceMapping?: {
		[K in ReferenceExpression<DatabaseSchema, TB> as K extends string | number | symbol
			? K
			: never]?: ReferenceExpression<DatabaseSchema, TB>;
	};
};

export const parseLimitOrderSortFactory =
	<TB extends keyof DatabaseSchema>(options: ParseLimitOrderSortOptions<TB>) =>
	(queryParams: GenericLimitOrderSortReqQueryParams) => {
		const result: LimitOrderSort<TB, ReferenceExpression<DatabaseSchema, TB>> = {
			offset: cleanInt(queryParams.offset ?? queryParams.OFFSET),
			direction: (queryParams.direction ?? queryParams.DIRECTION) === 'asc' ? 'asc' : 'desc',
		};
		const lim = cleanInt(queryParams.limit ?? queryParams.LIMIT);
		if (lim) {
			if (options.maxLimit && lim > options.maxLimit) {
				result.limit = options.maxLimit;
			} else {
				result.limit = lim;
			}
		} else {
			result.limit = options.defaultLimit;
		}

		const ord = cleanString(queryParams.orderBy ?? queryParams.ORDER_BY);
		if (ord) {
			if (options.orderReferenceMapping) {
				const mapped =
					options.orderReferenceMapping[
						ord as keyof typeof options.orderReferenceMapping
					];
				if (mapped) {
					result.orderBy = mapped;
				} else if (options.allowUnmappedOrderReferences === true) {
					// may be unsafe if query is user-generated. Depends on how kysely handles this.
					result.orderBy = ord as ReferenceExpression<DatabaseSchema, TB>;
				}
			} else {
				result.orderBy = ord as ReferenceExpression<DatabaseSchema, TB>;
			}
		}

		return result;
	};

export const limitOrderSort = <TB extends keyof DatabaseSchema, O>(
	qb: SelectQueryBuilder<DatabaseSchema, TB, O>,
	options?: LimitOrderSort<TB>,
) => {
	if (!options) return qb;
	const limit = options.limit;
	const offset = options.offset;
	const orderBy = options.orderBy;
	const direction = options.direction;
	let q = qb;
	if (typeof limit === 'number') q = q.limit(limit);
	if (typeof offset === 'number') q = q.offset(offset);
	if (orderBy) q = q.orderBy(orderBy, direction ?? 'desc');
	return q;
};
