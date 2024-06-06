import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../model/context/user';

export const AccountPage: React.FC = () => {
	const { user } = useUser();
	if (user === null) {
		return <Navigate to={'/login'} />;
	}

	return (
		<>
			<Outlet />
		</>
	);
};
