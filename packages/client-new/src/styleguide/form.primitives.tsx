import styled from 'styled-components';

export const Form = styled.form`
	width: 100%;
	padding: 2rem;

	max-width: 24rem;
`;

export const Title = styled.h2`
	font-size: 1.5rem;
	line-height: 1.75;
	font-weight: bold;
`;

export const Description = styled.p`
	margin-bottom: 2rem;
	padding-top: 1rem;

	font-size: 0.875rem;
	line-height: 1.5;

	border-top: 1px solid white;
`;

export const FieldContainer = styled.div<{ $invalidInput: boolean }>`
	width: 100%;
	max-width: 100%;
	min-width: 100%;
	margin-bottom: 1.5rem;
`;

export const FieldLabel = styled.label`
	margin-bottom: 0.5rem;

	font-size: 0.875rem;
	font-weight: bold;

	color: rgb(255 255 255 / 0.75);

	${FieldContainer}:focus > &, ${FieldContainer}:focus-visible > &, ${FieldContainer}:focus-within > & {
		color: rgb(255 255 255 / 1);
	}
`;

export const InvalidTextInputMessage = styled.div`
	display: block;
	margin-left: auto;
	width: fit-content;

	font-size: 0.875rem;
	font-weight: bold;
	height: 1rem;
	margin-bottom: -1rem;

	color: rgb(255 0 0);
`;

export const TextInput = styled.input.withConfig({ attrs: [{ type: 'text' }] })<{
	$invalidInput?: boolean;
}>`
	padding: 0.75rem 1rem;
	width: 100%;

	font-size: 1rem;

	outline: none;
	border-radius: 0.25rem;
	border: solid 1px rgb(255 255 255 / 0.1);
	background-color: rgb(26 26 26);

	&::placeholder {
		color: rgb(255 255 255 / 0.5);
	}

	&:focus-visible,
	&:focus {
		border-color: rgb(255 255 255 / 0.3);
	}

	${({ $invalidInput = false }) => ($invalidInput ? `border-color: rgb(255 0 0);` : '')};
`;

export const PasswordInput = styled(TextInput).withConfig({ attrs: [{ type: 'password' }] })``;

export const StatusContainer = styled.div`
	margin-top: 1rem;
`;

export const StatusHeading = styled.h3<{ $status?: 'success' | 'error' | 'none' }>`
	font-weight: bold;
	font-size: 1.125rem;

	color: ${({ $status = 'none' }) =>
		$status === 'error'
			? `rgb(255 0 0)`
			: $status === 'success'
				? `rgb(0 255 0)`
				: 'rgb(255 255 255)'};
`;

export const StatusDescription = styled.p`
	font-size: 0.875rem;
`;

export const SubmitButton = styled.button`
	width: 100%;
	padding: 0.625em 1em;
	margin-top: 2rem;
	cursor: pointer;
	user-select: none;

	font-size: 1rem;
	font-weight: bold;

	border-radius: 0.5em;

	color: rgb(255 255 255 / 0.8);
	border: solid 1px rgb(255 255 255 / 0.2);

	transition: all 0.2s ease-in-out;

	&:hover {
		color: rgb(255 255 255 / 1);
		border-color: rgb(255 255 255 / 0.5);
	}

	&:disabled {
		color: rgb(255 255 255 / 0.4);
		border-color: rgb(255 255 255 / 0.2);
		pointer-events: none;
	}
`;
