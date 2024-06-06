import { type ServerAPI } from '@xaro/server';
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from 'react';
import { loadAboutUser } from '../loaders/user/about-user';

export type UserContext = ServerAPI.GetAboutUser.Success;
const userContext = createContext<{
	user: UserContext | null;
	forceUpdateUserContext: () => void;
	logoutUser: () => Promise<void>;
	fetchUserData: () => Promise<void>;
}>(null as never);

const forceRefreshAfterLogout = (e: PageTransitionEvent) => {
	if (e.persisted) {
		window.location.reload();
	}
};

export const UserContextProvider: React.FC<PropsWithChildren> = ({
	children,
}) => {
	const [context, setContext] = useState<UserContext | null>(null);

	const fetchUserData = async () => {
		// User is only updated when aboutUser state is set to null.
		if (context !== null) {
			return;
		}

		return loadAboutUser().then((result) => {
			window.removeEventListener('pageshow', forceRefreshAfterLogout);
			setContext(result);
		});
	};

	useEffect(() => {
		if (context !== null) {
			return;
		}

		loadAboutUser()
			.then((result) => {
				window.removeEventListener('pageshow', forceRefreshAfterLogout);
				setContext(result);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [context]);

	const forceUpdateUserContext = () => setContext(null);

	const logoutUser = async () =>
		fetch(`/api/user/logout`, { method: 'POST' }).then((res) => {
			if (res.status !== 200) {
				return;
			}
			window.removeEventListener('pageshow', forceRefreshAfterLogout);
			window.addEventListener('pageshow', forceRefreshAfterLogout);
			window.location.href = '/';
			if (context === null) {
				return;
			}
			forceUpdateUserContext();
		});

	const Provider = userContext.Provider;
	return (
		<Provider
			value={{
				forceUpdateUserContext,
				user: context,
				logoutUser,
				fetchUserData,
			}}
		>
			{children}
		</Provider>
	);
};

export const useUser = () => useContext(userContext);
