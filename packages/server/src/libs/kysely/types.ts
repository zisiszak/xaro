import {
	type AnyColumn,
	type ComparisonOperatorExpression,
	type DeleteResult,
	type ExpressionOrFactory,
	type InsertResult,
	type MergeResult,
	type OperandValueExpressionOrList,
	type ReferenceExpression,
	type SelectType,
	type Simplify,
	type SqlBool,
	type UpdateResult,
} from 'kysely';

// directly copied from kysely for utility purposes
export type DrainOuterGeneric<T> = [T] extends [unknown] ? T : never;
export type ShallowRecord<K extends keyof any, T> = DrainOuterGeneric<{
	[P in K]: T;
}>;
export type SimplifySingleResult<O> = O extends InsertResult
	? O
	: O extends DeleteResult
		? O
		: O extends UpdateResult
			? O
			: O extends MergeResult
				? O
				: Simplify<O> | undefined;

export type KyselyWhere<
	DB,
	TB extends keyof DB,
	RE extends ReferenceExpression<DB, TB> = never,
> = RE extends any
	? Readonly<
			[
				lhs: RE,
				op: ComparisonOperatorExpression,
				rhs: OperandValueExpressionOrList<DB, TB, RE>,
			]
		>
	: ExpressionOrFactory<DB, TB, SqlBool>;

export type AllSelection<DB, TB extends keyof DB> = DrainOuterGeneric<{
	[C in AnyColumn<DB, TB>]: {
		[T in TB]: SelectType<C extends keyof DB[T] ? DB[T][C] : never>;
	}[TB];
}>;
