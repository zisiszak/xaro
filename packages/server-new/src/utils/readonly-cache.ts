import { type GenericError, newError } from 'exitus';

export interface ReadonlyCacheHandler<Data> {
	readonly syncPromise: Promise<void | GenericError> | null;
	sync(): Promise<void | GenericError>;
	get data(): Readonly<Data> | null;
}

export function newReadonlyCache<Data>(
	fetchData: () => Promise<Data>,
	debugName?: string,
): ReadonlyCacheHandler<Data> {
	let cache: Readonly<Data> | null = null;

	const readonlyCache: ReadonlyCacheHandler<Data> = {
		get data() {
			return cache;
		},
		syncPromise: null,
		async sync() {
			cache = null;
			if (this.syncPromise) {
				return this.syncPromise;
			}
			return ((this.syncPromise as any) = fetchData()
				.then((updated) => {
					cache = Object.freeze(updated);
				})
				.catch((err) => {
					return newError({
						caughtException: err,
						message: `Failed to sync ReadonlyCache${debugName ? ': ' + debugName : ''}`,
					});
				})
				.finally(() => ((this.syncPromise as any) = null)));
		},
	};

	return Object.freeze(readonlyCache);
}
