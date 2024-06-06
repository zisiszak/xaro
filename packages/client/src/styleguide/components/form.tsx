import styled from 'styled-components';
import { colour } from '../colour';
import { factor } from '../factor';

export const Form = styled.form`
	width: 100%;
	/* max-width: 24rem; */
	padding: 2rem;
	border-radius: 5px;
	color: white;
`;

export const FormTitle = styled.h1`
	margin-bottom: 0.5em;
	font-size: 1.5rem;
	font-weight: 700;

	@media (min-width: 768px) {
		font-size: 2rem;
	}
`;

export const FormDescription = styled.p`
	margin-bottom: 3em;
	padding-top: 1em;
	color: ${colour.text.main50};
	font-size: 0.75rem;
	line-height: 1.5;

	@media (min-width: 768px) {
		font-size: 0.875rem;
	}

	border-top: 1px solid ${colour.text.main10};
`;

export const FormNavigationContainer = styled.div`
	margin-bottom: 0.5em;
	font-weight: 500;
	font-size: 1rem;
	color: ${colour.text.main50};
`;

export const FormNaviationLink = styled.a`
	color: ${colour.text.main};
	font-weight: 700;
	letter-spacing: 0.05em;

	transition: all 0.2s ease;
	&:hover {
		color: ${colour.accent.info};
	}
`;

export const FormItemsContainer = styled.div`
	gap: 1.75rem;
	display: flex;
	flex-direction: column;
`;

export const FormFieldset = styled.fieldset`
	padding: ${factor.LG(0.25, 1)};
	margin: 0;
	border-radius: 0.5em;
	background-color: ${colour.background.main};
	border: 1px solid ${colour.text.main10};
`;

export const FormFieldsetLegend = styled.legend`
	font-size: ${factor.MD(1.125, 1)};
	color: ${colour.text.main};
`;

export const FormInputContainer = styled.div`
	width: fit-content;
	max-width: 100%;
	min-width: 100%;
`;

export const FormInputLabel = styled.label`
	font-size: ${factor.MD(0.75)};
	margin-bottom: 0.5em;
	margin-left: 0.875em;
	display: block;
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

export const FormTextInput = styled.input.attrs({ type: 'text' })`
	width: 100%;
	padding: 0.75em 1rem;
	border-radius: 0.5em;
	/* margin-top: 0.25em; */
	font-size: ${factor.MD(0.875)};
	border: none;
	background-color: ${colour.background.mainPlus};
	color: ${colour.text.main};
	letter-spacing: 0.05em;

	border: 1px solid transparent;

	&:focus-visible {
		outline: none;
		border: 1px double ${colour.text.main50};
	}

	&:focus {
		outline: none;
		border: 1px solid ${colour.text.main75};
	}

	&::placeholder {
		color: ${colour.text.main25};
	}

	.input-error > & {
		border: 1px solid ${colour.accent.error};
	}
`;

export const FormCheckboxInput = styled.input.attrs({ type: 'checkbox' })``;

export const FormFilesInput = styled(FormTextInput).attrs({
	type: 'file',
})`
	border: 1px solid transparent;
	&:invalid {
		border: 1px solid ${colour.accent.error};
	}
`;

export const FormPasswordInput = styled(FormTextInput).attrs({
	type: 'password',
})``;

export const FormSelectInput = styled.select`
	width: 100%;
	padding: 0.75rem 1rem;
	border-radius: 0.5em;
	margin-top: 0.25em;
	font-size: 1rem;
	border: none;
	background-color: ${colour.background.mainPlus};
	color: ${colour.text.main};
	letter-spacing: 0.05em;

	&::placeholder {
		color: ${colour.text.main25};
	}

	.input-error > & {
		border: 1px solid ${colour.accent.error};
	}
`;

export const FormErrorMessage = styled.p`
	padding-bottom: 0.5em;
	margin-bottom: 2em;
	color: ${colour.accent.error};
	font-weight: 700;
	/* border-bottom: 1px solid ${colour.accent.error}; */
	letter-spacing: 0.05em;
	text-align: center;
`;

export const FormSuccessMessage = styled.p`
	padding-bottom: 0.5em;
	margin-bottom: 2em;
	color: ${colour.accent.success};
	font-weight: 700;
	letter-spacing: 0.05em;
	text-align: center;
`;

export const FormSubmitButton = styled.input.attrs({ type: 'submit' })`
	width: 100%;
	padding: 0.625em 1em;
	margin-top: 2rem;
	font-size: ${factor.MD(0.875)};
	/* font-weight: 700; */
	cursor: pointer;
	border-radius: 0.5em;
	color: ${colour.text.main};
	background-color: ${colour.background.main};
	border: 1px solid ${colour.text.main50};

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
