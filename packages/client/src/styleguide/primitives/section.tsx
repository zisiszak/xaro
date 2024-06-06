/* eslint-disable react-refresh/only-export-components */
import styled from 'styled-components';
import { factor } from '../factor';

export const base = styled.section`
	overflow: hidden;
	position: relative;
`;

export const Standard = styled(base)`
	padding: ${factor.LG(2, 1)};
`;
