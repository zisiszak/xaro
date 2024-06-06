import { ServerAPI } from '@xaro/server';
import queryString from 'query-string';
import { useEffect } from 'react';

export interface LoadContentSortingTagsProps {
	setContentSortingTags: (
		props: ServerAPI.GetContentSortingTags.Success,
	) => void;
	queryParams?: ServerAPI.GetContentSortingTags.Query;
}
export const loadContentSortingTags = ({
	setContentSortingTags,
	queryParams,
}: LoadContentSortingTagsProps) => {
	useEffect(() => {
		fetch(
			queryString.stringifyUrl({
				url: '/api/content/sorting-tags',
				query: queryParams as Record<string, string | number | boolean>,
			}),
			{
				method: 'GET',
			},
		).then(async (res) => {
			if (res.status !== 200) {
				return;
			}

			const tags =
				(await res.json()) as ServerAPI.GetContentSortingTags.Success;
			setContentSortingTags(tags);
		});
	}, [
		queryParams?.platformCommunity,
		queryParams?.platformCommunityId,
		queryParams?.platform,
		queryParams?.platformId,
		queryParams?.search,
		queryParams?.contentKind,
		queryParams?.isFavourite,
		queryParams?.platformProfileId,
		queryParams?.platformProfile,
		queryParams?.minRating,
		queryParams?.sortingTags,
	]);
};
