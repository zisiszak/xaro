export type ErrorTuple<ErrorType extends NonNullable<unknown>> = [error: ErrorType];
export type ResultTuple<ResultType> = [error: undefined, result: ResultType];

// eslint-disable-next-line @typescript-eslint/ban-types
export type ErrorOrResultTuple<ResultType, ErrorType extends {}> =
	| ErrorTuple<ErrorType>
	| ResultTuple<ResultType>;

// eslint-disable-next-line @typescript-eslint/ban-types
export function errorTuple<ErrorType extends {}>(error: ErrorType): ErrorTuple<ErrorType> {
	return [error];
}

export function resultTuple<ResultType>(result: ResultType): ResultTuple<ResultType> {
	return [undefined, result];
}
