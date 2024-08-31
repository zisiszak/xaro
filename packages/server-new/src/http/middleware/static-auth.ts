import { type RequestHandler } from 'express';

const STATIC_MEDIA_ROUTE_BASELENGTH = '/static.media'.length;

export const StaticMediaAuthMiddleware: RequestHandler = async (req, res, next) => {
	const userAccessToken = req.userAccessToken!;

	let hasAccess: boolean = false;
	if (userAccessToken.role === 'admin') {
		hasAccess = true;
	} else {
		const libraryPath = req.originalUrl.slice(16);
	}
};
