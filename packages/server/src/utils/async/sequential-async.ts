import { GenericError, newError } from 'exitus';

export const sequentialAsync = async <Arg, Result, CatchErrors extends boolean = false>(
	func: (args: Arg, index: number) => Promise<Result>,
	argsMap: Arg[],
	catchErrors: CatchErrors = false as CatchErrors,
): Promise<(CatchErrors extends true ? Result | GenericError : Result)[]> => {
	const resultMap: Promise<CatchErrors extends true ? Result | GenericError : Result>[] = [];

	let promise: Promise<CatchErrors extends true ? GenericError | Result : Result> =
		Promise.resolve() as any;
	argsMap.forEach((arg, i) => {
		promise = promise.then(async () => {
			const p = func(arg, i).catch((err) => {
				const outcome = newError({
					message: 'Sequential async callback rejected.',
					caughtException: err,
					context: {
						args: arg,
					},
				});
				if (catchErrors) {
					return outcome as CatchErrors extends true ? GenericError : never;
				}
				return Promise.reject(outcome);
			}) as Promise<CatchErrors extends true ? Result | GenericError : Result>;
			resultMap.push(p);
			return p;
		});
	});

	return promise.then(() => Promise.all(resultMap));
};
