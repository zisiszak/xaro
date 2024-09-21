import createClient from 'openapi-fetch';
import { User } from '../model/context/user';
import { paths } from './types';

const client = createClient<paths>({
	baseUrl: '/api/',
});

export const api = client;

export const getAboutUser = async (setUser: (user: null | User) => void) => {
	await api.GET('/user/about').then((result) => {
		if (result.data) {
			setUser({
				userID: result.data.id!,
				username: result.data.username!,
			});
		} else {
			setUser(null);
		}
	});
};

export const logoutUser = async (setUser: (user: null | User) => void) => {
	await api.POST('/user/logout').then((result) => {
		if (result.response.status !== 205) {
			console.error('Failed to log out user.');
		}

		setUser(null);
	});
};
