import styled, { css, keyframes } from 'styled-components';
import { type GalleryStyle } from '../../model/context/view-preferences.js';
import { colour } from '../../styleguide/colour.js';
import { factor } from '../../styleguide/factor.js';
import { ImageWithLoader } from '../image-with-loader.js';

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

export const Container = styled.div<{
	$galleryStyle: GalleryStyle;
	$selectionModeEnabled: boolean;
	$selected: boolean;
}>`
	position: relative;
	overflow: hidden;
	font-size: ${factor.LG(1)};
	max-width: 100%;
	text-decoration: none;
	opacity: 0;
	transform: translateY(1em);
	animation: ${animateIn} 0.25s ease-out forwards 0.1s;
	user-select: none;

	${({ $galleryStyle: galleryStyle }) => {
		switch (galleryStyle) {
			case 'square-grid-lg':
				return css`
					display: flex;
					align-items: center;
					justify-content: center;
					max-height: 75svh;
					aspect-ratio: 1 / 1;
					border-radius: 0.25em;
				`;
			case 'square-grid-md':
			case 'square-grid-sm':
				return css`
					display: flex;
					align-items: center;
					justify-content: center;
					max-height: 50svh;
					aspect-ratio: 1 / 1;
					border-radius: 0.25em;
				`;
			case 'column':
				return css`
					width: 100%;
					margin: 0 auto;
				`;
			default:
			case 'list':
				return css`
					font-size: ${factor.LG(1)};
					display: flex;
					flex-direction: row;
					align-items: flex-start;
					height: 6em;
				`;
		}
	}}

	${({ $selectionModeEnabled: selectionModeEnabled }) => css`
		${selectionModeEnabled &&
		css`
			& * {
				cursor: default !important;
			}
		`};
	`}
`;

export const SelectionToggle = styled.div`
	position: absolute;
	top: 0.5em;
	right: 0.5em;

	font-size: ${factor.MD(0.825)};
	font-weight: 700;
	width: 1.5em;
	height: 1.5em;
	border-radius: 50%;

	border: 2px solid ${colour.text.main50};

	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 0 0.5em 0 rgb(0 0 0 / 0.75);
	background-color: rgb(0 120 212);
	color: ${colour.text.main};
`;

export const BackgroundImage = styled.img`
	width: 100%;
	height: 100%;
	min-height: fit-content;
	max-height: 100%;
	position: absolute;
	object-fit: cover;
	display: block;
	filter: blur(1em);
`;

export const Title = styled.a`
	font-weight: 700;
	font-size: ${factor.LG(0.875)};
	margin: 0;
	display: block;
	overflow: hidden;
	max-width: 100%;
	line-height: 1.5;
	color: ${colour.text.main};
	text-decoration: none;
`;

export const Duration = styled.div`
	position: absolute;
	display: block;
	right: 0.375em;
	bottom: 0.375em;
	padding: 0.25em 0.5em;
	border-radius: 0.25em;
	width: fit-content;
	background-color: rgb(0 0 0 / 0.75);
	line-height: 1;
	font-weight: 500;
	font-size: ${factor.SM(0.75)};
	/* border-radius: 0.5em; */
	color: ${colour.text.main};
	box-shadow: 0 0 0.5em 0 rgb(0 0 0 / 1);
`;

export const ThumbnailContainer = styled.div<{
	$galleryStyle: GalleryStyle;
	$selected: boolean;
}>`
	position: relative;
	font-size: ${factor.LG(1)};

	${({ $selected: selected }) =>
		selected &&
		css`
			background-color: black;
			& ${Duration} {
				opacity: 0.5;
				text-shadow: none;
			}
		`}

	${({ $galleryStyle: galleryStyle }) => {
		if (galleryStyle === 'list') {
			return css`
				width: 8em;
				height: 100%;
				flex: none;
			`;
		}
		if (galleryStyle === 'column') {
			return '';
		}

		return css`
			width: 100%;
			height: 100%;
		`;
	}}
`;

export const ThumbnailImage = styled(ImageWithLoader)<{
	$galleryStyle: GalleryStyle;
	$selected: boolean;
}>`
	cursor: pointer;
	position: relative;
	width: 100%;

	& img {
		object-fit: cover;
		object-position: center;
		width: 100%;
		user-select: none;
		pointer-events: none;
	}
	${({ $selected: selected }) =>
		selected &&
		css`
			opacity: 0.65;
		`}
	${({ $galleryStyle: galleryStyle }) =>
		galleryStyle === 'column'
			? css`
					& img {
						height: auto;
						max-height: 65svh;
					}
				`
			: galleryStyle === 'list'
				? css`
						height: 100%;
						& img {
							height: 100%;
						}
					`
				: css`
						height: 100%;
						border-radius: inherit;
						& img {
							height: 100%;
						}
					`};
`;

export const BottomWrap = styled.div`
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

export const InteractionsContainer = styled.div`
	flex: 0;
	font-size: ${factor.LG(1)};
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	gap: 0.375em;
	align-items: center;
`;

export const FavouriteIcon = styled.div<{ favourite?: 0 | 1 | null }>`
	cursor: pointer;
	pointer-events: all;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.2em;

	position: relative;
	border: none;
	stroke: none;
	line-height: 1;
	/* scale: 1.25; */

	background-color: ${({ favourite }) =>
		favourite === 1 ? 'rgb(220 60 50)' : 'transparent'};
	border-radius: 50%;
	aspect-ratio: 1 / 1;
	filter: drop-shadow(0 0 0.2em rgb(0 0 0 / 0.3));
	color: ${({ favourite }) =>
		favourite === 1 ? 'white' : 'rgb(255 255 255 / 0.75)'};
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

export const PlayIcon = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;

	cursor: pointer;
	text-decoration: none;
	font-weight: 700;
	overflow: hidden;
	user-select: none;
	border: none;
	stroke: none;

	top: 50%;
	right: 50%;
	width: fit-content;
	transform: translate(50%, -50%);
	transform-origin: 100% 0%;
	padding: 0.5em;
	border-radius: 50%;
	background-color: rgb(0 0 0 / 0.5);
	/* backdrop-filter: blur(0); */
	color: rgb(255 255 255 / 0.75);
	aspect-ratio: 1 / 1;
	overflow: hidden;
	font-size: ${factor.LG(1.5)};
	pointer-events: none;
	transition: all 0.15s ease-out;
	${Container}:hover & {
		/* backdrop-filter: blur(0.25rem); */
		background-color: rgb(0 0 0 / 0.65);
		color: rgb(255 255 255 / 1);
	}
	${Container}:active & {
		transform: scale(0.875) translate(50%, -50%);
		color: rgb(255 255 255 / 0.5);
	}
`;

export const DetailsContainer = styled.div`
	flex: auto;
`;
