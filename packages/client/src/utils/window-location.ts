import queryString from 'query-string';

export const mergeLocationSearchString = (props: Record<string, any>) =>
	queryString.stringify({
		...queryString.parse(window.location.search),
		...props,
	});

export const appendLocationSearch = (props: Record<string, any>) => {
	window.location.search = mergeLocationSearchString(props);
};
