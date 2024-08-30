// import { newError } from 'exitus';
// import { type ReferenceExpression, type SelectQueryBuilder } from 'kysely';
// import { type Schema } from '~/models/database/tables/index.js';

// export function whereQB<DB, Table extends keyof DB, Column extends keyof DB[Table], O>(
// 	qb: SelectQueryBuilder<DB, Table, O>,
// 	column: Column,
// 	value: DB[Table][Column] | ReadonlyArray<DB[Table][Column]>,
// ): SelectQueryBuilder<any, any, any> {
// 	if (typeof value === 'undefined') {
// 		return qb;
// 	}
// 	if (Array.isArray(value)) {
// 		return qb.where(column, 'in', value);
// 	}
// 	return qb.where(column, '=', value as any);
// }

// interface WhereCondition<V> {
// 	allowLists?: boolean;
// 	/** Provide a formatter if using a LIKE comparison */
// 	likeFormatter?: (value: V) => V;
// }
// type SimpleWhereConditions<Table extends keyof Schema, Column extends keyof Schema[Table]> = {
// 	[K in Column]: Readonly<WhereCondition<Schema[Table][K]>>;
// };

// export type WhereInput<Table extends keyof Schema, Column extends keyof Schema[Table]> = {
// 	[K in Column]?: Schema[Table][K] | Schema[Table][K][];
// };

// export function createWhereAndFilter<
// 	Table extends keyof Schema,
// 	O,
// 	Column extends keyof Schema[Table],
// >(
// 	table: Table,
// 	conditions: SimpleWhereConditions<Table, Column>,
// ): (
// 	qb: SelectQueryBuilder<Schema, Table, O>,
// 	where: WhereInput<Table, Column>,
// ) => SelectQueryBuilder<Schema, Table, O> {
// 	const conditionKeys = new Set<keyof typeof conditions>(Object.keys(conditions) as Column[]);

// 	return (qb: SelectQueryBuilder<Schema, Table, O>, where: WhereInput<Table, Column>) => {
// 		(Object.keys(where) as Column[]).forEach((key) => {
// 			if (!conditionKeys.has(key)) return;
// 			const { allowLists, likeFormatter } = conditions[key];

// 			const value = where[key];
// 			const column = `${table as string}.${key as string}` as ReferenceExpression<
// 				Schema,
// 				Table
// 			>;
// 			if (typeof value === 'undefined') return;
// 			if (value === null) {
// 				qb = qb.where(column, 'is', null);
// 			} else if (Array.isArray(value)) {
// 				if (!allowLists) {
// 					throw newError({
// 						message: 'List was provided but is not allowed.',
// 						stack: true,
// 						log: 'error',
// 					});
// 				}
// 				qb = qb.where(column, 'in', value);
// 			} else if (likeFormatter) {
// 				qb = qb.where(column, 'like', likeFormatter(value as Schema[Table][Column]));
// 			} else {
// 				qb = qb.where(column, '=', value);
// 			}
// 		});

// 		return qb;
// 	};
// }
