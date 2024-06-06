import { GenericError, errorOutcome } from '../outcomes.js';

// TODO: Fix this up cos it broke

/**
 * ### Promise Utility Function
 * Resolves promises in chunks, executing the provided callback on each argument element. Max concurrency is limited to the `maxConcurrentTasks` defined (hence 'queued').
 *
 * #### Testing
 * ```ts
 * await (async () => {
 *	const promiseMap: Promise<void>[] = [];
 *
 *	promiseMap[0] = Promise.resolve().then(() => {
 *		console.log('A');
 *		promiseMap[0] = promiseMap[0]!.then(() => {
 *			console.log('B');
 *		});
 *	});
 *
 *	return Promise.all(promiseMap);
 * })();
 *
 * // Output:
 * // 'A'
 * // 'B'
 * ```
 */
export const queuedAsync = <T, O>(
	func: (args: T) => Promise<O>,
	argsMap: T[],
	maxConcurrentTasks: number,
) => {
	const mapLength = argsMap.length;
	const reversedArgs = [...argsMap].reverse();

	const workers: Promise<O | void | GenericError>[] = new Array(
		maxConcurrentTasks,
	).map(() => Promise.resolve());
	const promises: Promise<O | GenericError>[] = [];
	const results: (O | GenericError)[] = [];

	const appendPromise = (mapIndex: number): void => {
		if (reversedArgs.length > 0) {
			const currentIndex = mapLength - reversedArgs.length;
			const poppedArg = reversedArgs.pop()!;
			const p = workers[mapIndex]!.then(async () =>
				func(poppedArg)
					.catch((err) => errorOutcome({
					caughtException: err,
					message: "Queued async unhandled exception."
					}))
					.then((result) => {
						appendPromise(mapIndex);
						results[currentIndex] = result;
						return result;
					}),
			);
			workers[mapIndex] = p;
			promises.push(p);
		}
	};

	// Appends the first promise in the chain for each worker
	workers.forEach((_promise, index) => {
		appendPromise(index);
	});

	return {
		async resolve() {
			await Promise.all(workers);
		},
		workers: workers,
		/**
		 * This array will be updated as new promises are queued. Promises can be awaited within it individually.
		 *
		 * Note: awaiting all queuedPromises does not guarantee that all promises created by `queuedAsync` will be resolved.
		 */
		queuedPromises: promises,
		/**
		 * This will not contain all results until the `resolve()` method has been called and awaited (which resolves all workers).
		 */
		results: results,
	};
};
