declare global {
	export type UnpackArray<T extends any[] | readonly any[]> = T[keyof T] extends infer U
		? U
		: never;
}
