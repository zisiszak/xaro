import styled from 'styled-components';
import { colour } from '../../styleguide/colour';
import { factor } from '../../styleguide/factor';

export const Container = styled.div`
	position: relative;
	display: flex;
	padding: 1em;
	flex-direction: row;
	align-items: flex-start;
	justify-content: flex-start;
	gap: 2em;

	background-color: ${colour.background.mainPlus};

	font-size: ${factor.MD(1)};

	border-radius: 0 0 0.5em 0.5em;
	box-shadow: 0 0.5em 0.75em 0 rgb(0 0 0 / 50%);
`;

export const PrimaryDetailsContainer = styled.div`
	flex: auto;
`;

export const Title = styled.a`
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;

	font-weight: 500;
	font-size: ${factor.LG(0.875)};
	margin: 0;

	overflow: hidden;
	max-width: 100%;
	width: 100%;

	color: ${colour.text.main};
	line-height: 1.5;
	text-decoration: none;
`;

export const ExternalEngagementMetadata = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	gap: 2em;
	margin-bottom: 1.5em;

	font-size: ${factor.SM(0.75)};
	color: ${colour.text.main50};
`;

export const ExternalEngaementTag = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 0.25em;

	line-height: 1.5;

	word-wrap: normal;
	color: ${colour.text.main50};

	& svg {
		fill: currentColor;
	}

	a& {
		text-decoration: none;
		&:hover {
			color: ${colour.text.main};
		}
	}
`;

export const Description = styled.p`
	font-size: ${factor.SM(0.75)};
	color: ${colour.text.main75};
	font-weight: 500;
`;

export const TagsFlex = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-start;
	gap: 0.5em;
	margin-top: 0.75em;

	font-size: ${factor.XS(1)};
`;

export const Tag = styled.div`
	padding: 0.375em 0.5em;
	width: fit-content;

	font-size: 0.75em;
	font-weight: 700;

	text-decoration: none;

	background-color: ${colour.accent.tag};
	color: ${colour.text.main};

	border-radius: 0.5em;
`;
