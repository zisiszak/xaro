import { JSDOM } from 'jsdom';
import { errorOutcome } from './outcomes.js';

export interface FetchedWebsiteAboutData {
	openGraphImage: string | null;
	openGraphTitle: string | null;
	openGraphSiteName: string | null;
	description: string | null;
	siteTitle: string | null;
	canonical: string | null;
}

export async function fetchWebsiteAboutData(
	url: string,
): Promise<FetchedWebsiteAboutData> {
	return JSDOM.fromURL(url)
		.then((dom) => {
			const head = dom.window.document.head;
			const openGraphImage =
				head
					.querySelector('meta[property="og:image"][content]')
					?.getAttribute('content') ?? null;
			const openGraphTitle =
				head
					.querySelector('meta[property="og:title"]')
					?.getAttribute('content') ?? null;
			const openGraphSiteName =
				head
					.querySelector('meta[property="og:site_name"]')
					?.getAttribute('content') ?? null;
			const description =
				head
					.querySelector('meta[name="description"][content]')
					?.getAttribute('content') ?? null;
			const siteTitle =
				head.getElementsByTagName('title')[0]?.innerText ?? null;
			const canonical =
				head
					.querySelector('link[rel="canonical"]')
					?.getAttribute('href') ?? null;

			return {
				openGraphImage,
				openGraphTitle,
				openGraphSiteName,
				description,
				siteTitle,
				canonical,
			};
		})
		.catch((err: unknown) =>
			Promise.reject(
				errorOutcome({
					message: 'Unhandled exception fetching website about data.',
					caughtException: err,
				}),
			),
		);
}
