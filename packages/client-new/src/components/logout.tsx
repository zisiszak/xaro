import { useUser } from '../model/context/user';
import { logoutUser } from '../server-api';
import { SubmitButton } from '../styleguide/form.primitives';

export const LogoutButton = () => {
	const { user, setUser } = useUser();
	const handleLogout = () => logoutUser(setUser);

	return (
		<SubmitButton disabled={user === null} onClick={handleLogout}>
			Logout
		</SubmitButton>
	);
};
