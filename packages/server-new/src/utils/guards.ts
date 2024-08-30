import { createGuard, is } from 'is-guard';

export function isNumberAndPositive(value: unknown): value is number {
	return typeof value === 'number' && value >= 0;
}
export function isNumberAndPositiveInteger(value: unknown): value is number {
	return isNumberAndPositive(value) && Math.round(value) === value;
}

export const isStringArray = createGuard.arrayAndEvery(is.string);
