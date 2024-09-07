// export type CacheableUsingID<StaleSym extends symbol, PromisesSym extends symbol> = {
// 	[key in StaleSym]: boolean;
// } & {
// 	[key in PromisesSym]: Array<Promise<any>>;
// };

// export interface ConstructableFromID<O, Args extends unknown[] = []> {
// 	new (id: number, ...args: Args): O;
// }

// export class CacheUsingID<
// 	StaleSym extends symbol,
// 	PromisesSym extends symbol,
// 	O extends CacheableUsingID<StaleSym, PromisesSym>,
// 	Args extends unknown[] = [],
// > {
// 	readonly #staleSymbol: StaleSym;
// 	readonly #promisesSymbol: PromisesSym;

// 	readonly #ctor: ConstructableFromID<O, Args>;
// 	#idMap: Map<number, O> = new Map();

// 	async deleteWhenFree(id: number): Promise<void> {
// 		const obj = this.#idMap.get(id);
// 		if (!obj) return;
// 		this.#idMap.delete(id);
// 		(obj[this.#staleSymbol] as boolean) = true;
// 		await Promise.allSettled(obj[this.#promisesSymbol]);
// 	}

// 	constructor(
// 		constructor: ConstructableFromID<O, Args>,
// 		staleSym: StaleSym,
// 		promisesSym: PromisesSym,
// 	) {
// 		this.#ctor = constructor;
// 		this.#staleSymbol = staleSym;
// 		this.#promisesSymbol = promisesSym;
// 	}

// 	new(id: number, ...args: Args): O {
// 		if (this.#idMap.has(id)) {
// 			return this.#idMap.get(id)!;
// 		} else {
// 			const obj = new this.#ctor(id, ...args);
// 			this.#idMap.set(id, obj);
// 			return obj;
// 		}
// 	}
// }
