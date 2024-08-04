export type DeepFreeze<Obj> = {
	readonly [Key in keyof Obj]: DeepFreeze<Obj[Key]>;
};

/**
 * Utility function for recursively freezing objects (including arrays).
 * **WARNING**: Freezes the passed object (along with any freezeable object property values) in place.
 * @param object - Object to recursively freeze
 * @returns A reference to the same object, now deeply frozen.
 */
export function deepFreeze<Obj extends object | unknown[]>(object: Obj): DeepFreeze<Obj> {
	const keys = Array.isArray(object) ? Array.from(object.keys()) : Object.keys(object);
	keys.forEach((key) => {
		const v = object[key as keyof Obj];
		if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) {
			deepFreeze(v);
		}
	});
	return Object.freeze(object);
}
