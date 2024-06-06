import styled from 'styled-components';
import { colour } from '../../styleguide/colour';
import { factor } from '../../styleguide/factor';
import { setVar, useVar } from '../../utils/css';

const boxShadowRadius = '--box-shadow-radius';
const boxShadowOpacity = '--box-shadow-opacity';

export const Wrap = styled.a`
	${setVar(boxShadowRadius, '0.5em')};
	${setVar(boxShadowOpacity, 0.3)};
	cursor: pointer;
	user-select: none;

	display: block;
	position: relative;
	overflow: hidden;
	padding: 1.5em 2em;

	font-size: ${factor.LG(1)};
	background-color: ${colour.background.mainMinus};
	text-decoration: none;

	border-radius: 0.5em;
	box-shadow: 0 0 ${useVar(boxShadowRadius)} 0
		rgb(0 0 0 / ${useVar(boxShadowOpacity)});

	@media (any-hover: hover) {
		transition: box-shadow 0.25s ease-out;

		&:hover {
			${setVar(boxShadowRadius, '1em')};
			${setVar(boxShadowOpacity, 0.2)};
		}
	}
`;

export const DetailsIconWrap = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	gap: 1em;
`;

export const DetailsWrap = styled.div`
	flex: 1;
`;

export const IconWrap = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 2.25em;
	margin-right: -0.5em;

	font-size: ${factor.LG(1)};

	perspective-origin: bottom center;
	perspective: 5em;
`;

export const IconPlate = styled.div`
	position: absolute;
	width: 2.25em;
	height: 2.25em;
	aspect-ratio: 1 / 1;

	background-color: transparent;

	border-radius: 50%;
	border: 2px solid ${colour.text.main10};

	font-smooth: always;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	@media (any-hover: hover) {
		box-shadow: 0 0 0.25em 0 rgb(0 0 0 / 0.25);
		transform: rotate3d(1, 0, 0, 0deg) translate3d(0, 0, 0);
		transform-style: preserve-3d;
		shape-rendering: optimizeSpeed;
		transform-origin: 50% 100%;

		transition:
			transform 0.2s ease-out,
			background-color 0.2s ease-in,
			box-shadow 0.2s ease-out,
			border 0.2s linear;

		${Wrap}:hover & {
			box-shadow: 0.1em 0.5em 0.5em 0 rgb(0 0 0 / 0.5);
			transform: rotate3d(1, 0, 0, 66deg) translate3d(0, 0.5em, 0)
				scale3d(1.25, 1.25, 1);
			background-color: ${colour.text.main10};
			border: 2px solid ${colour.text.main25};
			transition-delay: 0.05s, 0.05s, 0.05s, 0s;
		}
	}
`;

export const Icon = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;

	font-weight: 700;
	width: 1.5em;
	height: 1.5em;
	aspect-ratio: 1 / 1;

	& > svg {
		fill: currentColor;
	}

	color: ${colour.text.main50};
	transform: scale(1.25);
	@media (any-hover: hover) {
		transform: translate3d(0, 0, 0) scale(1.25);
		transform-style: preserve-3d;
		text-shadow: 0 0em 0em rgb(0 0 0 / 0);
		transition:
			color 0.25s ease-in-out 0s,
			transform 0.25s ease-in-out 0s,
			text-shadow 0.25s ease-out 0s;

		${Wrap}:hover & {
			transform: translate3d(0, -4%, 0.75em) scale(1.5);
			color: ${colour.text.main};
			text-shadow: 0 0.2em 0.3em rgb(0 0 0 / 0.5);
		}
	}
`;

export const Kind = styled.p`
	display: block;
	margin-bottom: 0.75em;
	width: 100%;

	font-size: ${factor.SM(0.875)};
	font-weight: 700;
	line-height: 1;

	color: ${colour.accent.info};

	border-bottom: 1px solid ${colour.text.main10};
	padding-bottom: 0.5em;
`;

export const Title = styled.h2`
	color: ${colour.text.main};

	font-size: ${factor.LG(1.25)};
	font-weight: 700;
	line-height: 1.25;
`;

export const Description = styled.p`
	font-size: ${factor.SM(0.75)};
	font-weight: 400;
	color: ${colour.text.main75};
	margin-top: 1em;
`;
