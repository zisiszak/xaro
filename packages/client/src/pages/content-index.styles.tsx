import styled from 'styled-components';
import { colour } from '../styleguide/colour.js';
import { factor } from '../styleguide/factor.js';
import { mediaQuery } from '../styleguide/media-query.js';

export const Section = styled.section`
	padding: ${factor.LG('1.5rem', '2rem')};
	background-color: ${colour.background.main};
`;

export const Container = styled.div`
	margin: 0 auto;
	max-width: 80rem;
	width: 100%;

	font-size: ${factor.LG('1rem')};
`;

export const MediaSidebarFlex = styled.div`
	display: flex;
	gap: 1em;
	flex-direction: column;
	justify-content: stretch;

	${mediaQuery.minWidth.LG} {
		justify-content: flex-start;
		flex-direction: row;
	}
`;

export const MediaWrap = styled.div`
	${mediaQuery.minWidth.XL} {
		min-width: 64rem;
	}
	width: 100%;

	background-color: ${colour.background.main};
`;

export const Sidebar = styled.div`
	width: 100%;
`;

export const ViewWrap = styled.div`
	overflow: hidden;
	width: 100%;
	max-height: 100svh;

	margin-bottom: 2em;
	display: flex;
	justify-content: center;
	align-items: center;

	${mediaQuery.minWidth.MD} {
		height: 80svh;
	}
`;

export const ImageMedia = styled.img`
	overflow: hidden;
	width: 100%;
	height: 100%;
	max-height: 100%;
	max-width: 100%;
	object-fit: contain;
	border-radius: ${factor.MD('0.5rem')};
`;

export const VideoMedia = styled(ImageMedia).attrs({ as: 'div' })``;

export const MediaTitle = styled.h2`
	font-weight: 700;
	font-size: ${factor.XL('1.25rem')};
	margin-top: 0.5em;
	color: ${colour.text.main};
`;

export const MediaDescription = styled.p`
	margin: 0;
	font-size: ${factor.LG('0.875rem')};
	line-height: 1.5;
	color: ${colour.text.main75};
`;

export const CategoryFlex = styled.div`
	display: flex;
	gap: 0.5em;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
`;

export const CategoryLabel = styled.div`
	font-size: ${factor.LG('0.75rem')};
	padding: 0.25em 0.5em;
	background-color: ${colour.background.mainPlus};
	color: ${colour.text.main75};
`;

export const PlatformUserWrap = styled.div`
	display: flex;
	gap: 1em;
	align-items: center;
`;

export const PlatformUsername = styled.h3`
	font-weight: 700;
	font-size: 0.875em;

	margin-bottom: 2em;
`;
