import { type ServerAPI } from '@xaro/server';

export const updateMedia = (
	contentId: number,
	props: ServerAPI.UpdateContent.Body,
) =>
	fetch(`/api/content/${contentId}/update`, {
		method: 'POST',
		body: JSON.stringify(props),
		headers: {
			'Content-Type': 'application/json',
		},
	});
