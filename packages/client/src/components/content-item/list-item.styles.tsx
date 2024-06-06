import styled from 'styled-components';
import { colour } from '../../styleguide/colour';
import { factor } from '../../styleguide/factor';

export const Container = styled.a`
	font-size: ${factor.MD(1)};
	padding: 1.5em;

	background-color: ${colour.background.mainPlus};
	color: ${colour.text.main};

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;

	flex: auto;
	height: 100%;

	border-radius: 0 0.5em 0.5em 0;
	box-shadow: 0 0.5em 0.75em 0 rgb(0 0 0 / 50%);

	text-decoration: none;
`;

export const PrimaryDetailsContainer = styled.div`
	flex: auto;
`;

export const ExtensionTag = styled.div`
	font-size: ${factor.SM(0.75)};
	padding: 0.25em 1em;
	background-color: ${colour.accent.info};
	color: ${colour.background.mainPlus};
	border-radius: 0.5em;
	font-weight: 700;
	line-height: 1;
	text-transform: uppercase;
	width: fit-content;
	margin-bottom: 1em;
`;

export const Title = styled.h4`
	font-size: ${factor.LG(0.875)};
	font-weight: 500;
	color: ${colour.text.main};
	margin: 0;
`;

export const Description = styled.p`
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	font-size: 0.75em;
	line-height: 1.25;
	overflow-wrap: break-word;
	word-wrap: break-word;
	word-break: break-all;
	word-break: break-word;
	margin: 0;
	margin-top: 0.5em;
	color: ${colour.text.main75};
`;
