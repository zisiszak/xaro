import { type ServerAPI } from '@xaro/server';
import { useEffect } from 'react';

export const loadContentThumbnailFiles = ({
	contentIds,
	setThumbs,
}: {
	contentIds: number[] | null;
	setThumbs: (props: ServerAPI.GetContentThumbnailFiles.Success) => void;
}) => {
	useEffect(() => {
		if (contentIds === null) return;

		Promise.all(
			contentIds.map(async (contentId) =>
				fetch(`/api/content/${contentId}/files/thumbs`, {
					method: 'GET',
				})
					.then((res) => {
						if (res.status !== 200) {
							return null;
						}
						return res.json() as Promise<ServerAPI.GetContentThumbnailFiles.Success>;
					})
					.catch(() => null),
			),
		)
			.then((result) => {
				const thumbs = result
					.map((item) => {
						if (!item || item.length === 0) {
							return null;
						}
						return item[0]!;
					})
					.filter(<T>(item: T | null): item is T => item !== null);

				setThumbs(thumbs);
			})
			.catch((err: unknown) => {
				console.error(err);
			});
	}, [contentIds]);
};
