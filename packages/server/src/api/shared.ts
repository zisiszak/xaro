export type ApiSortedArray<
	Result,
	Sorting extends object = Record<string, never>,
	Filters extends Record<
		string,
		string | number | null | boolean | undefined
	> = Record<string, never>,
> = {
	totalCount?: number;
	parsedSorting: Sorting;
	parsedFilters: Filters;
	results: Result[];
};
export type ApiSortedIds = ApiSortedArray<number>;

export type ApiError<Reason extends string = never> = {
	error: Reason | 'INTERNAL_ERROR';
	message?: string;
};

export type * from './content/types.js';
export type * from './platform/types.js';
export type * from './user/types.js';
