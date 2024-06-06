import { type ServerAPI } from '@xaro/server';
import queryString from 'query-string';
import { useEffect } from 'react';

export type LoadContentItemsProps = {
	setContentItems: (props: ServerAPI.GetAllContent.Success) => void;
	queryParams?: ServerAPI.GetAllContent.Query;
};

export const loadContentItems = ({
	setContentItems,
	queryParams,
}: LoadContentItemsProps) => {
	useEffect(() => {
		fetch(
			queryString.stringifyUrl({
				url: '/api/content',
				query: queryParams as Record<string, string | number | boolean>,
			}),
			{
				method: 'GET',
			},
		)
			.then(async (response) => {
				if (response.status === 401) {
					return Promise.reject('UNAUTHORISED');
				}
				if (response.status === 404) {
					return Promise.reject('NOT_FOUND');
				}
				if (response.status === 500) {
					return Promise.reject('INTERNAL_SERVER_ERROR');
				}
				if (response.status !== 200) {
					return Promise.reject('UNEXPECTED_ERROR');
				}
				const contentItems =
					(await response.json()) as ServerAPI.GetAllContent.Success;
				setContentItems(contentItems);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [
		queryParams?.platformCommunityId,
		queryParams?.platform,
		queryParams?.offset,
		queryParams?.limit,
		queryParams?.search,
		queryParams?.orderBy,
	]);
};
