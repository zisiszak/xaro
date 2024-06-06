import { is } from 'is-guard';

export type * from './generic-types.js';

export type BoolishInt = 0 | 1;
export function toBoolishInt(bool: boolean): BoolishInt {
	return bool ? 1 : 0;
}
export function parseBoolishInt(int: BoolishInt): boolean {
	return int === 1 ? true : false;
}

export type DeepFreeze<Obj> = {
	readonly [Key in keyof Obj]: DeepFreeze<Obj[Key]>;
};
/**
 * Utility function for recursively freezing objects (including arrays).
 * **WARNING**: Freezes the passed object (along with any freezeable object property values) in place.
 * @param object - Object to recursively freeze
 * @returns A reference to the same object, now deeply frozen.
 */
export function deepFreeze<Obj extends object | unknown[]>(
	object: Obj,
): DeepFreeze<Obj> {
	const keys = Array.isArray(object)
		? Array.from(object.keys())
		: Object.keys(object);
	keys.forEach((key) => {
		const v = object[key as keyof Obj];
		if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) {
			deepFreeze(v);
		}
	});
	return Object.freeze(object);
}

export type SingularPluralWordPair = [singular: string, plural?: string];

export function isSingularPluralWordPair(
	value: unknown,
): value is SingularPluralWordPair {
	return (
		is.arrayAndEvery(value, is.string) &&
		value.length >= 1 &&
		value.length <= 2
	);
}
