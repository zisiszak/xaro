export type CssVar = `--${string}`;

export const setVar = (cssVar: CssVar, value: string | number) =>
	`${cssVar}:${value}`;
export const useVar = (cssVar: CssVar, fallback: string | number = '') =>
	`var(${cssVar}${fallback !== '' ? ',' : ''}${fallback})`;
