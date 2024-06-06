import { keyframes, styled } from 'styled-components';

export const PreviewImagesWrap = styled.div`
	display: grid;
	width: 100%;
	height: 8em;
	flex-grow: 0;
	gap: 4px;

	grid-auto-flow: column;

	@media (min-width: 768px) {
		grid-auto-flow: dense;
		grid-template-columns: 1fr;
		max-height: 12em;
		min-height: 100%;
	}

	@media (min-width: 991px) {
		grid-template-columns: repeat(3, 1fr);
	}
`;

const fadeIn = keyframes`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
	`;

export const PreviewImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	overflow: hidden;
	max-width: 100%;
	max-height: 100%;
	object-position: center;

	opacity: 0;
	animation: ${fadeIn} 0.25s ease-out forwards calc(var(--index) * 0.2s);
`;
