import styled from 'styled-components';
import { colour } from '../../styleguide/colour.js';
import { FormPrimitive } from '../../styleguide/components/index.js';
import { factor } from '../../styleguide/factor.js';
import { mediaQuery } from '../../styleguide/media-query.js';

export const Fieldset = styled(FormPrimitive.Fieldset)`
	display: block;
	overflow: hidden;

	&:focus,
	&:focus-within {
		border-color: ${colour.text.main50};
	}
	transition: all 0.25s ease-in-out;
	padding: 0;
`;

export const FieldsetLegend = styled(FormPrimitive.FieldsetLegend)`
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	width: 100%;
	min-width: fit-content;
	justify-content: space-between;
	align-items: center;
	gap: 1em;

	font-size: ${factor.MD(1)};
`;

export const AllButButtonsContainer = styled.div`
	padding: ${factor.MD(1)};
`;

export const FilenameThumbnailContainer = styled.div`
	display: flex;
	flex-direction: column-reverse;
	align-items: flex-start;
	gap: 1em;
	height: ${factor.MD(3)};

	${mediaQuery.minWidth.MD} {
		flex-direction: row;
		align-items: center;
	}
`;

export const FileNameLabel = styled.h3`
	display: block;
	font-size: ${factor.MD(0.875)};
	font-weight: 700;
	color: ${colour.text.main};
	margin: 0;
	width: fit-content;
`;

export const FileDetailsContainer = styled.div`
	flex: 1;
	display: flex;
	align-self: flex-start;
	flex-direction: column-reverse;
	justify-content: center;
	align-items: flex-end;
	text-align: right;

	${mediaQuery.minWidth.MD} {
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		align-self: center;
		gap: 0.5em;
	}
`;

export const FileExtLabel = styled.div`
	padding: 0.25em 0.75em;
	background-color: ${colour.accent.info};
	width: fit-content;
	border-radius: 2em;
	text-align: center;

	font-weight: 700;
	font-size: ${factor.MD(0.75)};
	color: ${colour.background.main};
`;

export const FileSizeLabel = styled.p`
	font-size: ${factor.SM(0.75)};
	color: ${colour.text.main50};
	font-weight: 400;
`;

export const FileThumbnail = styled.img`
	font-size: ${factor.SM(1)};
	width: 3em;
	height: 3em;
	object-fit: cover;
	overflow: hidden;
	border-radius: 0.25em;

	transition: all 0.2s ease-in-out;
	&.collapsed {
		height: 0;
		width: 0;
		opacity: 0;
	}
`;

export const PreviewContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-height: 32rem;
	justify-content: center;
	align-items: center;
	font-size: ${factor.MD(1)};
	margin-top: 1em;
	overflow: hidden;
	border-radius: 0.5em;
`;

export const ImagePreview = styled.img`
	width: 100%;
	height: 100%;
	object-fit: contain;
	max-height: 32rem;
`;

export const ButtonsContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	overflow: hidden;
`;

export const ItemsContainer = styled(FormPrimitive.ItemsContainer)`
	margin-top: 1.5em;
`;

export const Button = styled.button`
	display: block;
	overflow: hidden;
	background-color: transparent;
	color: ${colour.text.main50};
	font-size: ${factor.SM(0.875)};
	font-weight: 400;
	cursor: pointer;
	padding: 1em;
	width: 100%;
	border: none;
	border-top: 1px solid ${colour.text.main10};
	border-right: 1px solid ${colour.text.main10};
	text-align: center;
	transition: all 0.2s ease-in-out;

	&:hover {
		color: ${colour.background.mainPlus};
	}
	&:last-of-type {
		border-right: none;
	}
`;

export const OptionsButton = styled(Button)`
	color: ${colour.text.main};
	&:hover {
		background-color: ${colour.accent.info};
	}
`;

export const RemoveButton = styled(Button)`
	color: ${colour.accent.error};
	&:hover {
		background-color: ${colour.accent.error};
	}
`;
