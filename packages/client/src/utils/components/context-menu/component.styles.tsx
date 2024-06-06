import { styled } from 'styled-components';
import { factor } from '../../../styleguide/factor';

export const Container = styled.div<{
	$xCssVar: string;
	$yCssVar: string;
}>`
	overflow: hidden;
	position: fixed;
	top: 0;
	left: 0;
	user-select: none;
	z-index: 1000;

	font-size: ${factor.LG(1)};

	border-radius: 0.5em;
	box-shadow: 0 0 1em rgba(0, 0, 0, 0.1);
	background-color: white;

	${({ $xCssVar: xCssVar, $yCssVar: yCssVar }) =>
		`transform: translate(var(${xCssVar}), var(${yCssVar}));`}
`;

export const List = styled.div`
	list-style: none;
	padding: 0;
	margin: 0;

	display: flex;
	flex-direction: column;

	background-color: white;

	border-radius: inherit;
`;

export const Title = styled.h2`
	padding: 0.5em 1em;
	width: 100%;
	font-size: 1em;
	text-align: left;

	border-top-right-radius: inherit;
	border-top-left-radius: inherit;

	background-color: #f5f5f5;
	color: #333;
	pointer-events: none;
`;

export const Item = styled.div`
	overflow: hidden;
	padding: 0.25em 1em;
	width: 100%;

	font-size: 0.875em;
	text-align: left;

	color: rgb(0 0 0 / 0.75);

	transition: all 0.2s ease;

	&:last-of-type {
		border-bottom-left-radius: inherit;
		border-bottom-right-radius: inherit;
	}

	&:hover {
		color: rgb(0 0 0 / 1);
	}
`;
