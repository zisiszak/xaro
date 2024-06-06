import styled, { css } from 'styled-components';
import { factor } from '../../styleguide/factor';

export const Container = styled.div<{ $isOpen: boolean }>`
	position: relative;
	overflow: visible;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: ${factor.LG(1)};
`;

export const BaseIcon = styled.div`
	cursor: pointer;
	pointer-events: all;
	display: flex;
	align-items: center;
	justify-content: center;

	font-size: ${factor.MD(0.625)};
	padding: 1em;
	border: none;
	stroke: none;
	line-height: 1;
	border-radius: 50%;
	aspect-ratio: 1 / 1;
	width: 2em;
	height: 2em;

	filter: drop-shadow(0 0 0.2em rgb(0 0 0 / 0.3));

	transition-property: background-color, color;
	transition-duration: 0.15s;
	transition-timing-function: ease-out;

	text-decoration: none;
	font-weight: 400;
	/* overflow: hidden; */
	user-select: none;

	& > svg {
		fill: currentColor;
	}

	&::before {
		content: '★';
		position: absolute;
		font-size: 1.375em;
		color: rgb(245 180 45);
		display: block;
		visibility: visible;
	}
`;

export const RatingStarGrid = styled.div<{
	$starCount: 1 | 2 | 3 | 4 | 5 | null;
	$isCurrent: boolean;
	$isRatingIcon?: boolean;
}>`
	pointer-events: all;
	cursor: pointer;
	display: grid;
	font-size: ${factor.MD(0.875)};
	width: 1.5em;
	height: 1.5em;
	color: ${({ $isCurrent: isCurrent, $isRatingIcon: isIcon }) =>
		isIcon
			? isCurrent
				? `rgb(245 180 45 / 0.9)`
				: `rgb(255 255 255 / 0.75)`
			: isCurrent
				? `rgb(245 180 45)`
				: `rgb(255 255 255 / 0.4)`};
	place-content: center;

	${({ $isRatingIcon: isIcon }) =>
		isIcon ? `filter: drop-shadow(0 0 0.125em rgb(0 0 0 / 0.75))` : ''};

	&:hover {
		${({ $isCurrent: isCurrent, $isRatingIcon: isIcon }) =>
			isCurrent
				? isIcon
					? css`
							color: rgb(245 180 45 / 1);
							& * {
								transform: none !important;
							}
						`
					: 'color: rgb(245 180 45 / 1)'
				: 'color: rgb(255 255 255 / 1)'}
	}
	transition: ${({ $isCurrent: isCurrent }) =>
		isCurrent ? 'color 0s linear;' : 'color 0.2s ease-out'};
	${({ $starCount: rating }) => {
		switch (rating) {
			case null: {
				return css`
					display: block;
				`;
			}
			case 1:
				return css`
					display: block;
					padding: 0.5em;
				`;
			case 2:
				return css`
					padding: 0.5em 0.375em;
					gap: 0.125em;
					place-content: center;
					grid-template-columns: 0.5em 0.5em;
					grid-template-rows: 0.5em;
					grid-template-areas: 'a b';
				`;
			case 3:
				return css`
					grid-template-columns: 0.3em 0.2em 0.1em 0.2em 0.3em;
					padding: 0.15em 0;
					gap: 0.1em 0;
					grid-template-rows: 0.5em 0.5em;
					grid-template-areas:
						'. a a a .'
						'b b . c c';
				`;
			case 4:
				return css`
					padding: 0.125em;
					gap: 0.125em;
					grid-template-columns: 0.5em 0.5em;
					grid-template-rows: 0.5em 0.5em;
					grid-template-areas:
						'a b'
						'c d';
				`;

			case 5:
				return css`
					padding: 0.0675em;
					grid-template-columns: 0.5em 0.125em 0.5em;
					grid-template-rows: 0.5em 0.125em 0.5em;
					grid-template-areas:
						'a . b'
						'. c .'
						'd . e';
				`;
		}
	}}
`;

export const NullStar = styled.div`
	font-size: 1.5em;
	display: flex;
	align-items: center;
	place-self: center;
	justify-content: center;
	pointer-events: none;
	line-height: 1;
`;

export const RatingStar = styled(NullStar)<{ $starIndex: 1 | 2 | 3 | 4 | 5 }>`
	font-size: 0.5em;
	display: flex;
	align-items: center;
	place-self: center;
	justify-content: center;
	pointer-events: none;
	line-height: 1;

	grid-area: ${({ $starIndex: starIndex }) => {
		switch (starIndex) {
			case 1:
				return 'a';
			case 2:
				return 'b';
			case 3:
				return 'c';
			case 4:
				return 'd';
			case 5:
				return 'e';
		}
	}};

	${({ $starIndex: starIndex }) => css`
		transition-delay: 0s;
		transition-property: transform;
		transition-duration: 0.2s;

		transform: rotate(0, 0, 1, 0deg);
		will-change: transform;

		${RatingStarGrid}:hover & {
			transition-delay: ${(starIndex - 1) * 50}ms;
			transform: rotate3d(0, 0, 1, 72deg);
		}
	`}
`;

export const PrimaryIcon = styled(BaseIcon)<{ $isRated?: boolean }>`
	position: relative;
	padding: 0.75em;
	color: ${({ $isRated: isRated }) =>
		isRated ? 'rgb(255 190 45)' : 'white'};
`;
/* color: ${({ isRated }) =>
		isRated ? 'white' : 'rgb(255 255 255 / 0.75)'}; */

export const SelectionContainer = styled.div`
	padding: 0.375em;
	position: absolute;
	display: flex;
	gap: 0.25em;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	top: -0.5em;
	transform: translate(0, -100%);
	box-shadow: 0 0 0.25em 0 rgb(0 0 0 / 0.25);
	background-color: rgb(0 0 0 / 0.5);
	backdrop-filter: blur(0.5rem);
`;

export const SelectionIcon = styled(BaseIcon)<{ $isCurrent?: boolean }>`
	position: relative;
	padding: 0.75em;
	color: ${({ $isCurrent: isCurrent }) =>
		isCurrent ? 'rgb(255 190 45)' : 'white'};
`;
/* color: ${({ isCurrent }) =>
		isCurrent ? 'white' : 'rgb(255 255 255 / 0.75)'}; */

export const ResetIcon = styled(SelectionIcon)`
	padding: 0;
	width: fit-content;
	height: fit-content;

	&::before {
		all: unset;
	}
`;
