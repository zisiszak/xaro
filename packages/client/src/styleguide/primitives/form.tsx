import styled from 'styled-components';
import { colour } from '../colour';
import { factor } from '../factor';

export const parent = styled.form`
	padding: 1em 2em;
	width: 100%;

	font-size: ${factor.LG(1)};

	color: ${colour.text.main};
	background-color: ${colour.background.mainMinus};

	border-radius: 0.5em;
`;

export const Title = styled.h2`
	margin-bottom: 0.5em;

	font-size: ${factor.LG(1.25)};
	font-weight: 700;
`;

export const Description = styled.p`
	margin-bottom: 3em;
	padding-top: 1em;
	color: ${colour.text.main50};
	font-size: ${factor.MD(0.75)};
	line-height: 1.5;

	border-top: 1px solid ${colour.text.main10};
`;

export const NavigationContainer = styled.div`
	margin-bottom: 0.5em;
	font-weight: 500;
	font-size: ${factor.MD(1)};
	color: ${colour.text.main50};
`;

export const NavigationLink = styled.a`
	color: ${colour.text.main};
	font-weight: 700;
	letter-spacing: 0.05em;

	transition: all 0.2s ease;
	&:hover {
		color: ${colour.accent.info};
	}
`;

export const FieldsContainer = styled.div`
	gap: ${factor.LG(1.5)};
	display: grid;
`;

export const StatusMessage = styled.p`
	padding-bottom: 0.5em;
	margin-bottom: 2em;

	font-size: ${factor.SM(0.875)};
	font-weight: 400;
	text-align: center;

	color: ${colour.text.main};
`;

export const ErrorMessage = styled(StatusMessage)`
	font-weight: 700;

	color: ${colour.accent.error};
`;

export const SuccessMessage = styled(StatusMessage)`
	font-weight: 700;

	color: ${colour.accent.success};
`;

export const SubmitButton = styled.input.attrs({ type: 'submit' })`
	padding: 0.625em 1em;
	margin-top: 2rem;
	width: 100%;
	cursor: pointer;

	font-size: ${factor.MD(0.875)};

	color: ${colour.text.main};
	background-color: ${colour.background.main};

	border: 1px solid ${colour.text.main50};
	border-radius: 0.5em;

	transition: all 0.2s ease;

	&:hover {
		border-color: ${colour.accent.info};
		color: ${colour.accent.info};
	}

	&:disabled {
		color: ${colour.text.main50};
		border-color: ${colour.text.main50};
	}
`;
