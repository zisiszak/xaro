import { type ServerAPI } from '@xaro/server';
import { useEffect } from 'react';
import { fetchAboutContent } from '../../fetch-endpoints/content';

export const loadAboutContent = ({
	contentId,
	setContent,
}: {
	contentId: number | null;
	setContent: (props: ServerAPI.GetAboutContent.Success) => void;
}) => {
	useEffect(() => {
		if (contentId === null) return;

		fetchAboutContent(contentId)
			.then(setContent)
			.catch((err) => {
				console.error(err);
			});
	}, [contentId]);
};
