import { styled } from 'styled-components';
import { colour } from '../../styleguide/colour.js';
import { factor } from '../../styleguide/factor.js';
import { Primitive } from '../../styleguide/index.js';
import { mediaQuery } from '../../styleguide/media-query.js';

export const GridSection = styled.section`
	padding: 4em 1.5em;
	color: ${colour.text.main};

	background-color: ${colour.background.main};

	font-size: 1rem;
	@media (min-width: 768px) {
		font-size: 1.25rem;
	}
`;

export const Grid = styled(Primitive.Container.LG)`
	display: grid;
	gap: 2rem;
	font-size: 1rem;

	@media (min-width: 768px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (min-width: 1024px) {
		grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
	}
`;

export const HeaderSection = styled.header`
	background-color: ${colour.background.main};
`;

export const HeaderContentContainer = styled(Primitive.Container.LG)`
	padding: ${factor.LG(0, 1)};
`;

export const HeaderImageContainer = styled(Primitive.Container.LG)`
	min-height: ${factor.LG(4)};
	position: relative;
	overflow: hidden;
`;

export const HeaderBannerImage = styled.img`
	display: block;
	width: 100%;
	object-fit: cover;
	overflow: hidden;

	height: ${factor.XXL(10)};
`;

export const HeaderContentTile = styled.div`
	padding: 0.5em 1.5em 1em 1.5em;
	margin-top: -1em;
	position: relative;

	font-size: ${factor.LG(1)};
	background-color: ${colour.background.mainMinus};
	border-radius: 0.5em;
	box-shadow: 0 0.25em 0.5em 0 rgb(0 0 0 / 50%);

	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: flex-start;
	align-items: flex-end;
	gap: 2em;
`;

export const NameLinkWrap = styled.div`
	display: flex;
	flex-direction: row;
	align-items: baseline;
	gap: 0 0.5em;
	flex-wrap: wrap;
`;

export const HeaderAvatarNameWrap = styled.div`
	display: flex;
	flex-direction: row;
	/* align-items: flex-start; */
	align-items: flex-end;
	gap: 1em;
`;

export const HeaderAvatar = styled.img`
	width: 6em;
	height: 6em;
	object-fit: cover;
	aspect-ratio: 1 / 1;
	overflow: hidden;
	border-radius: 50%;
	display: block;
	flex: none;

	font-size: ${factor.LG(1)};

	position: relative;
	margin-left: -0.5em;
	margin-top: calc(-1.5em - ${factor.LG(1)});

	box-shadow: 0 0.1em 0.25em 0 rgb(0 0 0 / 50%);
`;

export const HeaderProfileName = styled.h2`
	font-weight: 700;
	font-size: ${factor.LG(1)};
	color: ${colour.text.main};
	margin-bottom: 0.5em;
`;

export const ProfileDetails = styled.div`
	width: 100%;
`;

export const ProfileDescription = styled.p`
	font-size: ${factor.MD(0.75)};
	color: ${colour.text.main75};
	min-width: 100%;
	line-height: 1.5;

	${mediaQuery.minWidth.LG} {
		min-width: unset;
		max-width: 36em;
	}
`;

export const ProfileExternalLink = styled.a`
	font-size: ${factor.MD(0.75)};
	color: ${colour.accent.info50};

	transition: color 0.2s ease-in-out;
	&:hover {
		color: ${colour.accent.info};
	}
`;

export const ProfileSubscriberCount = styled.div`
	font-size: ${factor.MD(0.75)};
	font-weight: 700;
	color: ${colour.text.main};
	margin-bottom: 0.25em;
`;

export const CustomDetails = styled.div`
	padding-top: 1em;
	margin-top: 1.5em;
	border-top: 1px solid ${colour.text.main25};
	font-size: ${factor.MD(1)};
	min-width: 100%;
`;

export const HeaderTotalCount = styled.div`
	font-size: ${factor.MD(0.75)};
	font-weight: 400;
	color: ${colour.text.main75};
	text-emphasis: bold ${colour.text.main};
`;

export const Header = styled.div`
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

export const ExternalLink = styled.a`
	font-weight: 700;
	font-size: ${factor.LG('0.875rem')};
`;
