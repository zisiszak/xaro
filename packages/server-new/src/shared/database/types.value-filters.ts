type NonNull = NonNullable<unknown>;

export interface InValueFilter<V> {
	in?: (V & NonNull)[];
}
export interface NotInValueFilter<V> {
	notIn?: (V & NonNull)[];
}
export interface IsValueFilter<V> {
	is?: NonNull & V;
}
export interface IsNullValueFilter {
	is?: null;
}
export interface IsNotValueFilter<V> {
	isNot?: NonNull & V;
}
export interface IsNotNullValueFilter {
	isNot?: null;
}
export interface LikeValueFilter {
	like?: string;
}
export interface NotLikeValueFilter {
	notLike?: string;
}

export type ValueFilterUnion<V> =
	| InValueFilter<V>
	| NotInValueFilter<V>
	| IsValueFilter<V>
	| IsNotValueFilter<V>
	| IsNullValueFilter
	| IsNotNullValueFilter;

export type AllValueFilters<V> =
	| ((IsValueFilter<V> | IsNullValueFilter) | InValueFilter<V>)
	| ((IsNotValueFilter<V> | (IsNotNullValueFilter & NotInValueFilter<V>)) &
			// eslint-disable-next-line @typescript-eslint/ban-types
			(V extends string ? NotLikeValueFilter & LikeValueFilter : {}));

export const test: AllValueFilters<string> = {
	in: [''],
	notIn: [''],
};
