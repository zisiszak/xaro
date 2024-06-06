export type InferArrayElement<T> = T extends (infer U)[] ? U : never;

export type Unpick<T, K extends keyof T> = {
	[Key in keyof T as Key extends K ? never : Key]: T[Key];
};

/** Does not work for property names with a `.` */
export type ObjectPropertyPath<
	Name extends string | number,
	Obj extends Record<string, unknown>,
> = `${Name}.${keyof Obj extends infer Key
	? Key extends keyof Obj & (string | number)
		? Obj[Key] extends Record<string, unknown>
			? ObjectPropertyPath<Key, Obj[Key]> | Key
			: Key
		: never
	: never}`;

export type ConstructorType<T> = T extends string
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
