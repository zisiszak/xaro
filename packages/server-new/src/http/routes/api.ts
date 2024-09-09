import { Router } from 'express';
import { aboutMediaController, uploadMediaController } from '~/modules/media/index.js';
import {
	aboutUserController,
	userAccessTokenMiddleware,
	userLoginController,
	userLogoutController,
	userRegistrationController,
} from '~/modules/user/index.js';
import { mediaAccessMiddleware } from '../../modules/user-to-media/middleware/media-access.middleware.js';
import { basicAuthMiddleware } from '../middleware/basic-auth.middleware.js';

const router = Router();

// MIDDLEWARE
// router.all(['/platform', '/platform-community', '/platform-profile'], userAccessTokenMiddleware);
// router.all('/platform/:platform_id_or_name', PlatformAccessMiddleware);
// router.all(
// 	[
// 		'/platform/:platform_id_or_name/profile/:platform_profile_id_or_name',
// 		'/platform-profile/:platform_profile_id',
// 	],
// 	PlatformProfileAccessMiddleware,
// );
// router.all(
// 	[
// 		'/platform/:platform_id_or_name/community/:platform_community_id_or_name',
// 		'/platform-community/:platform_community_id',
// 	],
// 	PlatformCommunityAccessMiddleware,
// );

/* User: Registration */ router.post(
	'/user/register',
	basicAuthMiddleware,
	userRegistrationController,
);

/* User: Login */ router.post('/user/login', basicAuthMiddleware, userLoginController);

/* User: Logout */ router.post('/user/logout', userLogoutController);

/* User: About */ router.get('/user/about', userAccessTokenMiddleware, aboutUserController);

/* Media: All */ router.get('/media', userAccessTokenMiddleware);
/* Media: Upload */ router.post('/media/upload', userAccessTokenMiddleware, uploadMediaController);

router.all('/media/:media_id', userAccessTokenMiddleware, mediaAccessMiddleware);
/* Media: About */ router.get(
	'/media/:media_id/about',
	userAccessTokenMiddleware,
	mediaAccessMiddleware,
	aboutMediaController,
);

// /* Platform: About */ router.get('/platform/:platform_id_or_name/about', AboutPlatformController);

// /* Platform Community: About */
// router.get('/platform-community/:platform_community_id/about', AboutPlatformCommunityController);
// router.get(
// 	'/platform/:platform_id_or_name/community/:platform_community_id_or_name/about',
// 	AboutPlatformCommunityController,
// );

// /* Platform Profile: About */
// router.get('/platform-profile/:platform_profile_id/about', AboutPlatformProfileController);
// router.get(
// 	'/platform/:platform_id_or_name/profile/:platform_profile_id_or_name/about',
// 	AboutPlatformProfileController,
// );

export const apiRouter: Router = router;
