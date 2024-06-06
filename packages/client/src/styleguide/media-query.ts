export const mediaQuery = {
	minWidth: {
		MD: '@media (min-width: 479px)',
		LG: '@media (min-width: 767px)',
		XL: '@media (min-width: 991px)',
	},
} as const;
export type MediaQueryMinWidth = keyof typeof mediaQuery.minWidth;
