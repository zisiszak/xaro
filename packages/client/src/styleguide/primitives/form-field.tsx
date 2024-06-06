/* eslint-disable react-refresh/only-export-components */
import styled from 'styled-components';
import { colour } from '../colour';
import { factor } from '../factor';

export const parent = styled.div`
	width: fit-content;
	max-width: 100%;
`;

export const Label = styled.label`
	display: block;
	margin-bottom: 0.5em;
	margin-left: 0.875em;

	font-size: ${factor.MD(0.75)};
	font-weight: 700;
	letter-spacing: 0.1em;

	color: ${colour.text.main};

	transition: all 0.2s ease;

	&:focus,
	&:focus-within,
	&:focus-visible {
		opacity: 1;
		color: ${colour.accent.info};
	}

	&.input-error {
		color: ${colour.accent.error};
	}
`;
