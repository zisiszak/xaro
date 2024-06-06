import { type ServerAPI } from '@xaro/server';
import { useEffect } from 'react';

export const loadAboutPlatformProfile = ({
	setPlatformProfile,
	platformProfileId,
}: {
	setPlatformProfile: (
		props: ServerAPI.GetAboutPlatformProfile.Success,
	) => void;
	platformProfileId: number | null;
}) => {
	useEffect(() => {
		if (platformProfileId === null) return;

		fetch(`/api/platform/profile/about/${platformProfileId}`, {
			method: 'GET',
		})
			.then((response) => {
				if (response.status !== 200) {
					return Promise.reject(
						`Failed to fetch platform user ${platformProfileId}`,
					);
				}
				return response.json() as Promise<ServerAPI.GetAboutPlatformProfile.Success>;
			})
			.then((result) => {
				setPlatformProfile(result);
			})
			.catch((err: unknown) => {
				console.error(err);
			});
	}, [platformProfileId]);
};
