import styled from 'styled-components';

export const Grid = styled.div`
	display: grid;
	gap: 2rem;

	padding: 2em;

	font-size: 1rem;

	@media (min-width: 768px) {
		grid-template-columns: repeat(2, 1fr);
		font-size: 1.25rem;
	}
`;
