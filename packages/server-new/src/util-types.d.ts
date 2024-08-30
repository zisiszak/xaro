/* eslint-disable @typescript-eslint/consistent-type-imports */

export declare global {
	// Primitives

	/** integer boolean: true */
	type IntTrue = 1;
	/** integer boolean: false */
	type IntFalse = 0;
	/** int bool */
	type IntBool = IntTrue | IntFalse;

	// ---------------------------------------------------------
	// Objects and Arrays

	type Unpick<T, K extends keyof T> = {
		[Key in keyof T as Key extends K ? never : Key]: T[Key];
	};

	type InferArrayElement<T> = T extends (infer U)[] ? U : never;

	// ---------------------------------------------------------
	// Misc

	type ErrorResultTuple<Result, Error = import('exitus').GenericError> =
		| Readonly<[error: Error, result?: never]>
		| Readonly<[error: undefined, result: Result]>;

	type ConstructorType<T> = T extends string
		? StringConstructor
		: T extends number
			? NumberConstructor
			: T extends boolean
				? BooleanConstructor
				: T extends Array<any>
					? ArrayConstructor
					: T extends Record<string, any>
						? ObjectConstructor
						: never;

	type ObjectPropertyPath<
		Name extends string | number,
		Obj extends Record<string, unknown>,
	> = `${Name}.${keyof Obj extends infer Key
		? Key extends keyof Obj & (string | number)
			? Obj[Key] extends Record<string, unknown>
				? ObjectPropertyPath<Key, Obj[Key]> | Key
				: Key
			: never
		: never}`;
}
