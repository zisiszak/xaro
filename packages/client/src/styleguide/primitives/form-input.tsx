import styled from 'styled-components';
import { colour } from '../colour';
import { FormTextInput } from '../components/form';
import { factor } from '../factor';

export const Text = styled.input.attrs({ type: 'text' })`
	padding: 0.75em 1rem;
	width: 100%;

	font-size: ${factor.MD(0.875)};
	letter-spacing: 0.05em;

	background-color: ${colour.background.mainPlus};
	color: ${colour.text.main};

	border-radius: 0.5em;
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

export const Files = styled(FormTextInput).attrs({ type: 'file' })`
	border: 1px solid transparent;

	&:invalid {
		border: 1px solid ${colour.accent.error};
	}
`;

export const Password = styled(FormTextInput).attrs({ type: 'password' })``;

export const Select = styled.select`
	margin-top: 0.25em;
	padding: 0.75rem 1rem;
	width: 100%;

	font-size: ${factor.MD(0.875)};
	letter-spacing: 0.05em;

	background-color: ${colour.background.mainPlus};
	color: ${colour.text.main};

	border-radius: 0.5em;
	border: none;

	&::placeholder {
		color: ${colour.text.main25};
	}

	.input-error > & {
		border: 1px solid ${colour.accent.error};
	}
`;
