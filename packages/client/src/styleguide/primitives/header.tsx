import styled from 'styled-components';
import { colour } from '../colour';
import { factor } from '../factor';
import { mediaQuery } from '../media-query';

export const Header = styled.header`
	display: block;
	position: relative;
	width: 100%;
	font-size: 1rem;
	padding: 1.5em;
	padding-top: 4em;
	background-color: ${colour.background.main};
	color: ${colour.text.main};

	${mediaQuery.minWidth.LG} {
		font-size: 1.25rem;
		padding-top: 7em;
	}
`;

export const BannerWrap = styled.div`
	position: absolute;
	top: 0;
	left: 0;

	font-size: 1em;
`;

export const ImageBanner = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

export const DetailsAndButtonsWrap = styled.div`
	display: flex;
	flex-direction: column;

	gap: 2rem;

	${mediaQuery.minWidth.MD} {
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-end;
	}
`;

export const DetailsWrap = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

export const Title = styled.h1`
	font-size: ${factor.XL(2.5)};
	line-height: 1.25;
	font-weight: 700;
	color: ${colour.text.main};

	${mediaQuery.minWidth.MD} {
		font-size: 6rem;
	}
`;

export const Description = styled.p`
	font-size: 0.875rem;
	margin: 0;
	color: white;

	${mediaQuery.minWidth.MD} {
		font-size: 1rem;
	}
`;

export const ButtonsFlex = styled.div`
	display: flex;
	font-size: 0.875rem;
	gap: 1rem;

	${mediaQuery.minWidth.MD} {
		font-size: 1rem;
	}
`;

export const Button = styled.button`
	padding: 0.5em 1em;
	border: none;
	font-size: ${factor.MD(0.875)};
	cursor: pointer;
	background-color: ${colour.text.main};
	color: ${colour.background.main};
	transition:
		background-color 0.2s ease-in-out,
		color 0.2s ease-in-out,
		scale 0.2s ease-in-out;
	border-radius: 0.25em;

	&:hover {
		background-color: ${colour.background.main};
		color: ${colour.accent.info};
	}

	&:active {
		transform: scale(0.8);
	}
`;
