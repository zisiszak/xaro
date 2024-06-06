import queryString from 'query-string';
import { useState } from 'react';

export const usePagination = () => {
	const { page, itemLimit: initItemLimit } = queryString.parse(
		location.search,
	);

	const [itemLimit, setItemLimit] = useState<number>(
		typeof initItemLimit === 'string' ? +initItemLimit : 20,
	);
	const [pageNumber, setPageNumber] = useState<number>(
		typeof page === 'string' ? +page : 1,
	);
	const offset = (pageNumber - 1) * itemLimit;

	return {
		pageNumber,
		setPageNumber,
		itemLimit,
		setItemLimit,
		offset,
	};
};
