// import { type RequestHandler } from 'express';
// import { UserRoleEnum } from '~/modules/users/index.js';

// const STATIC_MEDIA_ROUTE_BASELENGTH = '/static.media'.length;

// export const StaticMediaAuthMiddleware: RequestHandler = async (req, res, next) => {
// 	const userAccessToken = req.userAccessToken!;

// 	let hasAccess: boolean = false;
// 	if (userAccessToken.role === UserRoleEnum.Admin) {
// 		hasAccess = true;
// 	} else {
// 		const libraryPath = req.originalUrl.slice(16);
// 	}
// };
