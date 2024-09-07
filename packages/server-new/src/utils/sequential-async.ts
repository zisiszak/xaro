import { exerr, type GenericExerr } from 'exitus';

export async function sequentialAsync<Arg, Result, CatchErrors extends boolean = false>(
	func: (args: Arg, index: number) => Promise<Result>,
	argsMap: Arg[],
	catchErrors: CatchErrors = false as CatchErrors,
): Promise<(CatchErrors extends true ? Result | GenericExerr : Result)[]> {
	const resultMap: Promise<CatchErrors extends true ? Result | GenericExerr : Result>[] = [];

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	let promise: Promise<CatchErrors extends true ? GenericExerr | Result : Result> =
		Promise.resolve() as any;
	argsMap.forEach((arg, i) => {
		promise = promise.then(async () => {
			const p = func(arg, i).catch((err) => {
				const outcome = exerr({
					message: 'Sequential async callback rejected.',
					caughtException: err,
					context: {
						args: arg,
					},
				});
				if (catchErrors) {
					return outcome as CatchErrors extends true ? GenericExerr : never;
				}
				return Promise.reject(outcome);
			}) as Promise<CatchErrors extends true ? Result | GenericExerr : Result>;
			resultMap.push(p);
			return p;
		});
	});

	return promise.then(() => Promise.all(resultMap));
}
