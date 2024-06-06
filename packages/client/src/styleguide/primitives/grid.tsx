/* eslint-disable react-refresh/only-export-components */
import styled from 'styled-components';
import { factor } from '../factor';
import { mediaQuery } from '../media-query';

export const LG = styled.div`
	display: grid;
	font-size: ${factor.LG(1)};
	gap: 2em;
	${mediaQuery.minWidth.LG} {
		grid-template-columns: repeat(2, 1fr);
	}
	${mediaQuery.minWidth.XL} {
		grid-template-columns: repeat(3, 1fr);
	}

	& > * {
		aspect-ratio: 1 / 1;
		overflow: hidden;
		height: 100%;
		max-width: 100%;
	}
`;

export const MD = styled.div`
	display: grid;
	font-size: ${factor.MD(1)};
	gap: 1.5em;
	${mediaQuery.minWidth.MD} {
		grid-template-columns: repeat(2, 1fr);
	}
	${mediaQuery.minWidth.LG} {
		grid-template-columns: repeat(3, 1fr);
	}
	${mediaQuery.minWidth.XL} {
		grid-template-columns: repeat(5, 1fr);
	}

	& > * {
		aspect-ratio: 1 / 1;
		overflow: hidden;
		height: 100%;
		max-width: 100%;
	}
`;

export const SM = styled.div`
	display: grid;
	font-size: ${factor.SM(1)};
	gap: 1em;
	grid-template-columns: 1fr 1fr;
	${mediaQuery.minWidth.MD} {
		grid-template-columns: repeat(3, 1fr);
	}
	${mediaQuery.minWidth.LG} {
		grid-template-columns: repeat(5, 1fr);
	}
	${mediaQuery.minWidth.XL} {
		grid-template-columns: repeat(7, 1fr);
	}
`;
