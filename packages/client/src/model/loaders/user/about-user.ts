import { type ServerAPI } from '@xaro/server';

export const loadAboutUser = async () =>
	fetch(`/api/user/about`, {
		method: 'GET',
		headers: {
			'Content-type': 'application/json',
		},
	}).then(async (res) => {
		if (res.status !== 200) {
			return Promise.reject(await res.json().catch(() => {}));
		}
		return res.json() as Promise<ServerAPI.GetAboutUser.Success>;
	});
