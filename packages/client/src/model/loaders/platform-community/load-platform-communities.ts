import { type ServerAPI } from '@xaro/server';
import { useEffect } from 'react';

export const loadPlatformCommunities = ({
	setCommunities,
	platformName,
}: {
	setCommunities: (
		communities: ServerAPI.GetAllPlatformCommunities.Success,
	) => void;
	platformName: string | null;
}) => {
	if (!platformName) {
		return;
	}

	useEffect(() => {
		fetch(`/api/platform/community/all/${platformName}`)
			.then(async (res) => {
				if (res.status !== 200) {
					console.error(res, 'Failed to load platform communities');
					return;
				}
				return res.json().then((communities) => {
					setCommunities(
						communities as ServerAPI.GetAllPlatformCommunities.Success,
					);
				});
			})
			.catch((err) => {
				console.error(err, 'Failed to load platform communities');
			});
	}, [platformName]);
};
