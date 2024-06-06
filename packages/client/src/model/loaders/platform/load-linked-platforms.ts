import { ServerAPI } from '@xaro/server';
import { useEffect } from 'react';

export const loadLinkedPlatforms = ({
	setPlatforms,
}: {
	setPlatforms: (props: ServerAPI.GetAllPlatforms.Success) => void;
}) => {
	useEffect(() => {
		fetch('/api/platform/all', {
			method: 'GET',
		})
			.then((res) => {
				if (res.status !== 200) {
					return Promise.reject('Failed to fetch linked platforms');
				}
				return res.json() as Promise<ServerAPI.GetAllPlatforms.Success>;
			})
			.then(setPlatforms)
			.catch((err) => {
				console.error(err);
			});
	}, []);
};
