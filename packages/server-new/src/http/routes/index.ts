import { Router } from 'express';
import {
	aboutUserController,
	uploadMediaController,
	userLoginController,
	userLogoutController,
	userRegistrationController,
} from '~/modules/index.controllers.js';
import { userAccessTokenMiddleware } from '~/modules/index.middleware.js';
import { mediaAccessMiddleware } from '../../modules/media/middleware/media-access.middleware.js';
import { AboutMediaController } from '../controllers/about-content.js';
import { AboutPlatformCommunityController } from '../controllers/about-platform-community.js';
import { AboutPlatformProfileController } from '../controllers/about-platform-profile.js';
import { AboutPlatformController } from '../controllers/about-platform.js';
import { AllMediaController } from '../controllers/all-media.js';
import { BasicAuthMiddleware } from '../middleware/basic-auth.js';
import { PlatformAccessMiddleware } from '../middleware/platform-access.js';
import { PlatformCommunityAccessMiddleware } from '../middleware/platform-community-access.js';
import { PlatformProfileAccessMiddleware } from '../middleware/platform-profile-access.js';

const router = Router();

// MIDDLEWARE
router.all(['/platform', '/platform-community', '/platform-profile'], userAccessTokenMiddleware);
router.all('/platform/:platform_id_or_name', PlatformAccessMiddleware);
router.all(
	[
		'/platform/:platform_id_or_name/profile/:platform_profile_id_or_name',
		'/platform-profile/:platform_profile_id',
	],
	PlatformProfileAccessMiddleware,
);
router.all(
	[
		'/platform/:platform_id_or_name/community/:platform_community_id_or_name',
		'/platform-community/:platform_community_id',
	],
	PlatformCommunityAccessMiddleware,
);

/* User: Registration */ router.post(
	'/user/register',
	BasicAuthMiddleware,
	userRegistrationController,
);

/* User: Login */ router.post('/user/login', BasicAuthMiddleware, userLoginController);

/* User: Logout */ router.post('/user/logout', userLogoutController);

/* User: About */ router.get('/user/about', userAccessTokenMiddleware, aboutUserController);

/* Media: All */ router.get('/media', userAccessTokenMiddleware, AllMediaController);
/* Media: Upload */ router.post('/media/upload', userAccessTokenMiddleware, uploadMediaController);

router.all('/media/:media_id', userAccessTokenMiddleware, mediaAccessMiddleware);
/* Media: About */ router.get(
	'/media/:media_id/about',
	userAccessTokenMiddleware,
	mediaAccessMiddleware,
	AboutMediaController,
);

/* Platform: About */ router.get('/platform/:platform_id_or_name/about', AboutPlatformController);

/* Platform Community: About */
router.get('/platform-community/:platform_community_id/about', AboutPlatformCommunityController);
router.get(
	'/platform/:platform_id_or_name/community/:platform_community_id_or_name/about',
	AboutPlatformCommunityController,
);

/* Platform Profile: About */
router.get('/platform-profile/:platform_profile_id/about', AboutPlatformProfileController);
router.get(
	'/platform/:platform_id_or_name/profile/:platform_profile_id_or_name/about',
	AboutPlatformProfileController,
);

export const apiRouter: Router = router;
