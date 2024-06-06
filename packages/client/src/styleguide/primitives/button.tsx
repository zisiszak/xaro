import styled from 'styled-components';
import { colour } from '../colour';
import { factor } from '../factor';

export const Generic = styled.button`
	cursor: pointer;
	user-select: none;
	padding: 0.5em 1em;
	width: fit-content;
	text-align: center;

	font-size: ${factor.SM(0.875)};

	color: ${colour.text.main90};
	background-color: ${colour.background.main};
	border-radius: 0.5em;
	border: 2px solid ${colour.text.main10};

	transform: scale(1);
	transition:
		border-color linear 0.2s,
		color linear 0.2s;

	@media (any-hover: hover) {
		&:hover {
			border-color: ${colour.text.main50};
		}
	}

	&:active {
		transform: scale(0.95);
		color: ${colour.text.main75};
		border-color: ${colour.text.main90};
	}

	&:disabled {
		color: ${colour.text.main50};
		border-color: ${colour.accent.error25};
	}
`;

export const Navbar = styled.a``;

export const Navigation = styled.button``;

export const Action = styled.button`
	width: fit-content;
`;

export const Submit = styled.button``;
