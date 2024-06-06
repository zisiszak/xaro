import styled from 'styled-components';
import { colour } from '../styleguide/colour.js';
import { factor } from '../styleguide/factor.js';

export const Container = styled.div`
	margin: 0 auto;
	max-width: 48rem;
	width: 100%;
`;

export const FileFieldsetsTitle = styled.h2`
	font-weight: 700;
	font-size: ${factor.LG(1.125)};
	margin-top: 2em;
	margin-bottom: 3em;
	color: ${colour.text.main};
`;

export const FileFieldsets = styled.div`
	font-size: ${factor.LG(1)};
	display: grid;
	gap: 3em;
`;
