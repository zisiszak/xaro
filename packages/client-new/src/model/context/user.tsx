import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAboutUser } from '../../server-api';

// TODO: Update API spec to include schema for user info
export interface User {
	userID: number;
	username: string;
	// extra details
}

interface UserContext {
	user: null | User;
	setUser: (user: null | User) => void;
}

const userContext = createContext<UserContext>(null as never);
export const UserContextProvider = ({ children }: React.PropsWithChildren) => {
	const [user, setUser] = useState<User | null>(null);
	const context = { user, setUser: (user: null | User) => void setUser(user) };

	useEffect(() => {
		if (!user) void getAboutUser(setUser);
	}, []);

	const ContextProvider = userContext.Provider;

	return <ContextProvider value={context}>{children}</ContextProvider>;
};

export const useUser = () => useContext(userContext);
