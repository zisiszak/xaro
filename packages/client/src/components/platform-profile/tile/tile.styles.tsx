import styled, { keyframes } from 'styled-components';
import { colour } from '../../../styleguide/colour.js';
import { factor } from '../../../styleguide/factor.js';
import { mediaQuery } from '../../../styleguide/media-query.js';

const animateIn = keyframes`
	from {
		opacity: 0;
		transform: translateY(1em);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
`;

export const Wrap = styled.a`
	width: 100%;
	position: relative;
	overflow: hidden;
	background-color: ${colour.background.mainMinus};
	color: ${colour.text.main};
	text-decoration: none;

	display: flex;
	flex-direction: column;

	font-size: ${factor.LG('1rem')};

	transform: translateY(1em);
	opacity: 0;
	animation: ${animateIn} 0.25s ease-out forwards 0.1s;

	${mediaQuery.minWidth.LG} {
		flex-direction: row;
	}
`;

export const IconWrap = styled.div<{ $primaryColor?: string }>`
	padding: 0.5rem;
	/* background-color: rgb(20, 20, 20); */
	border-radius: 50%;
	overflow: hidden;
	width: fit-content;
	height: fit-content;
	background-color: ${({ $primaryColor }) =>
		$primaryColor ?? 'rgb(20, 20, 20)'};
`;

export const Icon = styled.img`
	width: 4rem;
	height: 4rem;
	overflow: hidden;
	border-radius: inherit;
	object-fit: cover;
	display: block;
`;

export const DetailsWrap = styled.div`
	position: relative;
	/* display: flex; */
	/* flex-direction: column; */
	padding: 1em;
	gap: 0.5rem;
	font-size: 1rem;

	@media (min-width: 768px) {
		font-size: 1.25rem;
	}
	/* @media (min-width: 768px) { */
	/* flex-direction: row; */
	/* } */
`;

export const Name = styled.h3`
	margin: 0;
	font-size: ${factor.LG('1rem')};
	color: ${colour.text.main};
`;

export const Description = styled.div`
	font-size: ${factor.SM('0.75rem')};
	color: ${colour.text.main75};
`;

export const PostsDownloaded = styled.div`
	margin-top: 0.5em;
	font-size: ${factor.SM('0.75rem')};
	color: ${colour.text.main50};
`;
