/* eslint-disable react-refresh/only-export-components */
import styled from 'styled-components';
import { colour } from '../colour';
import { factor } from '../factor';

export const parent = styled.fieldset`
	padding: ${factor.LG(0.25, 1)};
	margin: 0;

	background-color: ${colour.background.main};

	border-radius: 0.5em;
	border: 1px solid ${colour.text.main10};
`;

export const Legend = styled.legend`
	font-size: ${factor.MD(1.125)};
	color: ${colour.text.main};
`;
