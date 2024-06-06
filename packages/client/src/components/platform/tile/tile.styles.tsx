import styled from 'styled-components';

export const Wrap = styled.a`
	width: 100%;
	position: relative;
	overflow: hidden;
	background-color: rgb(30, 30, 30);
	border-radius: 0.5rem;
	text-decoration: none;

	display: flex;
	flex-direction: column;

	font-size: 1rem;

	@media (min-width: 768px) {
		font-size: 1.25rem;
		flex-direction: row;
	}
`;

export const IconWrap = styled.div<{ $primaryColor?: string }>`
	padding: 0.5rem;
	/* background-color: rgb(20, 20, 20); */
	border-radius: 50%;
	overflow: hidden;
	width: fit-content;
	height: fit-content;
	background-color: ${({ $primaryColor }) =>
		$primaryColor ?? 'rgb(20, 20, 20)'};
`;

export const Icon = styled.img`
	width: 4rem;
	height: 4rem;
	overflow: hidden;
	border-radius: inherit;
	object-fit: cover;
	display: block;
`;

export const DetailsWrap = styled.div`
	position: relative;
	/* display: flex; */
	/* flex-direction: column; */
	padding: 1em;
	gap: 0.5rem;
	font-size: 1rem;

	@media (min-width: 768px) {
		font-size: 1.25rem;
	}
	/* @media (min-width: 768px) { */
	/* flex-direction: row; */
	/* } */
`;

export const Name = styled.h3`
	font-size: 1.5em;
	color: white;
`;

export const Description = styled.p`
	font-size: 0.875em;
	color: white;
`;

export const PostsDownloaded = styled.p`
	font-size: 0.75rem;
	color: rgb(150, 150, 150);
`;

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
export const PreviewImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	overflow: hidden;
`;
