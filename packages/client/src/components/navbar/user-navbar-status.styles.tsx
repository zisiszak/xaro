import styled from 'styled-components';
import { colour } from '../../styleguide/colour';
import { factor } from '../../styleguide/factor';

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`;

export const MessageUsernameContainer = styled.div`
	min-width: fit-content;
	flex: auto;
`;

export const Message = styled.p`
	font-size: ${factor.SM(0.75)};
	font-weight: 400;
	color: ${colour.text.main50};
	line-height: 1.25;
`;

export const Username = styled.p`
	line-height: 1.25;
	font-size: ${factor.SM(0.875)};
	font-weight: 700;
	color: ${colour.text.main};
`;

export const ActionButtonsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	width: fit-content;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
	gap: ${factor.MD(1)};
`;
