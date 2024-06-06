import { ServerAPI } from '@xaro/server';

export const fetchAboutContent = (contentId: number) =>
	fetch(`/api/content/${contentId}/about`, {
		method: 'GET',
	}).then((res) => {
		if (res.status !== 200) {
			return Promise.reject();
		}
		return res.json() as Promise<ServerAPI.GetAboutContent.Success>;
	});
