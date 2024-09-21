import styled from 'styled-components';
import { useUser } from '../../model/context/user';
import { LogoutButton } from '../logout';

const Section = styled.nav`
	display: block;
	padding: 0;
	margin: 0;
	outline: none;
	border: none;

	padding: 1rem 2rem;
	background-color: black;
	border-bottom: 1px solid rgb(255 255 255 / 0.2);
`;

const Username = styled.div`
	font-weight: bold;
	color: rgb(255 255 255);
	font-size: 0.875rem;
`;

const NotLoggedInText = styled.div`
	font-size: 0.875rem;
	color: rgb(255 255 255 / 0.75);
`;

export const Navbar = () => {
	const { user } = useUser();

	return (
		<Section>
			{user ? (
				<Username>{user.username}</Username>
			) : (
				<NotLoggedInText>Not logged in.</NotLoggedInText>
			)}
			{user && <LogoutButton />}
		</Section>
	);
};
