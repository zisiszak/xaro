import { type ServerAPI } from '@xaro/server';
import queryString from 'query-string';
import { useEffect } from 'react';

export const loadPlatformProfiles = ({
	platformName,
	setPlatformProfiles,
	limit = 20,
	offset,
	direction,
}: {
	platformName: string | null;
	setPlatformProfiles: (
		props: ServerAPI.GetAllPlatformProfiles.Success,
	) => void;
	limit?: number;
	offset?: number;
	direction?: 'asc' | 'desc';
}) => {
	useEffect(() => {
		if (platformName === null) return;

		fetch(
			`/api/platform/profile/all/${platformName}?${queryString.stringify({
				limit,
				offset,
				direction,
			} satisfies ServerAPI.GetAllPlatformProfiles.Query)}`,
			{
				method: 'GET',
			},
		)
			.then((res) => {
				if (res.status !== 200) {
					console.error(
						'Failed to load platform profiles',
						platformName,
					);
					return Promise.reject();
				}

				return res.json() as Promise<ServerAPI.GetAllPlatformProfiles.Success>;
			})
			.then((result) => {
				setPlatformProfiles(result);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [platformName, limit, offset, direction]);
};
