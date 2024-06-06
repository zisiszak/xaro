import styled from 'styled-components';
import { colour } from '../../styleguide/colour';
import { factor } from '../../styleguide/factor';

export const InteractionsContainer = styled.div`
	font-size: ${factor.LG(1)};
	display: flex;
	flex: none;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
	gap: 0.5em;
`;

export const FavouriteIcon = styled.div<{ $isFavourite?: 0 | 1 | null }>`
	font-size: ${factor.MD(1)};
	width: 1.25em;
	height: 1.25em;

	cursor: pointer;
	pointer-events: all;
	display: flex;
	align-items: center;
	justify-content: center;

	position: relative;
	border: none;
	stroke: none;
	line-height: 1;

	background-color: ${({ $isFavourite: favourite }) =>
		favourite === 1 ? 'rgb(220 60 50)' : 'transparent'};
	border-radius: 50%;
	aspect-ratio: 1 / 1;
	filter: drop-shadow(0 0 0.2em rgb(0 0 0 / 0.3));
	color: ${({ $isFavourite: favourite }) =>
		favourite === 1 ? colour.text.main : colour.text.main50};
	& > svg {
		fill: currentColor;
	}
	transition-property: background-color, color;
	transition-duration: 0.15s;
	transition-timing-function: ease-out;

	text-decoration: none;
	font-weight: 700;
	font-size: ${factor.LG(1)};
	overflow: hidden;
	user-select: none;

	&:hover {
		color: ${colour.text.main};
	}
`;

export const OptionsIcon = styled.div`
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	aspect-ratio: 1 / 1;

	font-size: ${factor.MD(1)};
	width: 1.25em;
	height: 1.25em;

	color: ${colour.text.main50};

	& svg {
		fill: currentColor;
	}

	&:hover {
		color: ${colour.text.main};
	}
`;
