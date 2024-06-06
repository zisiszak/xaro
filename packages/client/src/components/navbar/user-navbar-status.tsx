import React from 'react';
import { useUser } from '../../model/context/user';
import { Primitive } from '../../styleguide';
import * as S from './user-navbar-status.styles';

const notLoggedInMessages = ['Do I know you?'] as const;
const loggedInMessages = ['Welcome back,'] as const;

export const UserNavbarStatus: React.FC = () => {
	const { user, logoutUser } = useUser();

	const loggedIn = user !== null;
	const message = (loggedIn ? loggedInMessages : notLoggedInMessages)[
		Math.round(
			Math.random() *
				((loggedIn
					? loggedInMessages.length
					: notLoggedInMessages.length) -
					1),
		)
	]!;

	return (
		<S.Container>
			<S.MessageUsernameContainer>
				<S.Message>{message}</S.Message>
				{loggedIn === true && <S.Username>{user.username}</S.Username>}
			</S.MessageUsernameContainer>
			<S.ActionButtonsContainer>
				{loggedIn === true && (
					<Primitive.Button.Generic onClick={logoutUser}>
						Logout
					</Primitive.Button.Generic>
				)}
				{loggedIn === false && (
					<>
						<Primitive.Button.Generic as={'a'} href="/login">
							Login
						</Primitive.Button.Generic>
						<Primitive.Button.Generic as={'a'} href="/register">
							Register
						</Primitive.Button.Generic>
					</>
				)}
			</S.ActionButtonsContainer>
		</S.Container>
	);
};
