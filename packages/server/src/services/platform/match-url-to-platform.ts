import { db } from '~/index.js';

export const getPlatformMatchExpressions = async (): Promise<
	{
		urlRegExp: RegExp;
		id: number;
	}[]
> =>db
		.selectFrom('Platform')
		.select(['id', 'urlRegExp'])
		.execute()
		.then((platforms) =>
			platforms.map((platform) => ({
				urlRegExp: new RegExp(platform.urlRegExp),
				id: platform.id,
			})),
		);


export const matchUrlToPlatformId = async (url: string) => getPlatformMatchExpressions().then(
		(platforms) =>
			platforms.find(({ urlRegExp }) => urlRegExp.test(url))?.id,
	);