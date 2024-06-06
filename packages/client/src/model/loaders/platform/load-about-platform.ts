import { type ServerAPI } from '@xaro/server';
import { useEffect } from 'react';

export const loadAboutPlatform = ({
	platformName,
	setPlatform,
}: {
	platformName: string | null;
	setPlatform: (props: null | ServerAPI.GetAboutPlatform.Success) => void;
}) => {
	useEffect(() => {
		if (platformName === null) return;
		console.log(platformName);
		fetch(`/api/platform/about/${platformName}`, {
			method: 'GET',
		})
			.then((res) => {
				if (res.status !== 200) {
					console.error('Failed to load platform', platformName);
					return Promise.reject();
				}
				return res.json();
			})
			.then((result) => {
				setPlatform(result as ServerAPI.GetAboutPlatform.Success);
			})
			.catch(console.error);
	}, [platformName]);
};
