import styled, { css } from 'styled-components';
import { type GalleryStyle } from '../../model/context/view-preferences';
import { factor } from '../../styleguide/factor';
import { mediaQuery } from '../../styleguide/media-query';

export const Section = styled.section`
	padding: 4em 1.5em;
	color: white;

	font-size: ${factor.MD(1)};
`;

export const GridSection = styled.section`
	overflow: hidden;
	padding: 2em 0.25em;
`;

export const ColumnView = styled.section`
	display: grid;
	max-width: 48rem;
	width: 100%;
	margin: 0 auto;
	padding: 2em 0.25em;
	overflow: hidden;
	gap: 3em;
`;

export const Grid = styled.div<{
	galleryStyle: GalleryStyle;
}>`
	display: grid;

	${({ galleryStyle: size }) => {
		switch (size) {
			case 'square-grid-sm':
				return css`
					gap: 0.25em;
					font-size: ${factor.SM(0.875)};
					grid-template-columns: repeat(4, 1fr);
					${mediaQuery.minWidth.MD} {
						grid-template-columns: repeat(5, 1fr);
					}
					${mediaQuery.minWidth.LG} {
						grid-template-columns: repeat(8, 1fr);
					}
					${mediaQuery.minWidth.XL} {
						grid-template-columns: repeat(
							auto-fill,
							minmax(125px, 1fr)
						);
					}
				`;
			case 'square-grid-md':
				return css`
					font-size: ${factor.MD(1)};
					gap: 0.25em;
					grid-template-columns: repeat(3, 1fr);
					${mediaQuery.minWidth.MD} {
						grid-template-columns: repeat(5, 1fr);
					}
					${mediaQuery.minWidth.LG} {
						grid-template-columns: repeat(7, 1fr);
					}
					${mediaQuery.minWidth.XL} {
						grid-template-columns: repeat(
							auto-fill,
							minmax(250px, 1fr)
						);
					}
				`;
			case 'square-grid-lg':
				return css`
					gap: 0.25em;
					font-size: ${factor.LG(1)};
					grid-template-columns: repeat(2, 1fr);
					${mediaQuery.minWidth.MD} {
						grid-template-columns: repeat(3, 1fr);
					}
					${mediaQuery.minWidth.LG} {
						grid-template-columns: repeat(4, 1fr);
					}
					${mediaQuery.minWidth.XL} {
						grid-template-columns: repeat(
							auto-fill,
							minmax(550px, 1fr)
						);
					}
				`;
			default:
				return css`
					margin: 0 auto;
					max-width: 64rem;
					width: 100%;
					font-size: ${factor.LG(1)};
					gap: 3em;
				`;
		}
	}}
`;

export const Header = styled.header`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1em;
	font-size: 1rem;

	@media (min-width: 768px) {
		font-size: 1.25rem;
	}
`;
export const Title = styled.h1`
	font-weight: 700;
	font-size: 2em;
	margin-bottom: 1em;
	color: white;
	text-align: center;
`;
export const Description = styled.p`
	font-size: 1em;
	color: rgb(150, 150, 150);
`;
