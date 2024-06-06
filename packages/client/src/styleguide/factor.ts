import { is } from 'is-guard';
import { mediaQuery, type MediaQueryMinWidth } from './media-query.js';

const factorKinds = ['XS', 'SM', 'MD', 'LG', 'XL', 'XXL', 'XXXL'] as const;
type FactorKind = (typeof factorKinds)[number];

const factors = {
	XS: 1.02,
	SM: 1.04,
	MD: 1.07,
	LG: 1.1,
	XL: 1.14,
	XXL: 1.18,
	XXXL: 1.22,
} as const satisfies Record<FactorKind, number>;
const widthExponents = [
	[0, null],
	[1, 'MD'],
	[2, 'LG'],
	[3, 'XL'],
] as const satisfies [number, MediaQueryMinWidth | null][];

const calcFactor = (cssVar: string) => (value: number | string) =>
	`calc(${is.number(value) ? `${value}rem` : value} * var(${cssVar}))`;
const factorFactory =
	(cssVar: string) =>
	(...value: (number | string)[]) =>
		value.map(calcFactor(cssVar)).join(' ');

const initFactor = () => {
	const keys = Object.keys(factors);
	const cssVars = keys.map((key) => `--factor-${key}`);
	const values = Object.values(factors);

	const str = widthExponents.map(([exponent, width]) => {
		const result = values.map((factor) => Math.pow(factor, exponent));
		const mapped = cssVars
			.map((cssVar, i) => `${cssVar}: ${result[i]};`)
			.join('\n');
		if (width) {
			return `${mediaQuery.minWidth[width]} {
                    ${mapped}
                }`;
		}
		return mapped;
	});

	const factor = Object.fromEntries(
		keys.map((key, i) => [key, factorFactory(cssVars[i] as string)]),
	) as Record<FactorKind, (...value: (number | string)[]) => string>;

	return { factorCssString: str.join('\n'), factor };
};

export const { factorCssString, factor } = initFactor();
