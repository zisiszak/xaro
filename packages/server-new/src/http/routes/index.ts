import { Router } from 'express';
import { AboutContentController } from '../controllers/about-content.js';
import { AboutPlatformCommunityController } from '../controllers/about-platform-community.js';
import { AboutPlatformProfileController } from '../controllers/about-platform-profile.js';
import { AboutPlatformController } from '../controllers/about-platform.js';
import { AboutUserController } from '../controllers/about-user.js';
import { AllMediaController } from '../controllers/all-media.js';
import { UserLoginController } from '../controllers/user-login.js';
import { UserLogoutController } from '../controllers/user-logout.js';
import { UserRegistrationController } from '../controllers/user-registration.js';
import { BasicAuthMiddleware } from '../middleware/basic-auth.js';
import { MediaAccessMiddleware } from '../middleware/media-access.js';
import { PlatformAccessMiddleware } from '../middleware/platform-access.js';
import { PlatformCommunityAccessMiddleware } from '../middleware/platform-community-access.js';
import { PlatformProfileAccessMiddleware } from '../middleware/platform-profile-access.js';
import { UserAccessTokenMiddleware } from '../middleware/user-access-token.js';

const router = Router();

// MIDDLEWARE
router.all(
	['/content', '/platform', '/platform-community', '/platform-profile'],
	UserAccessTokenMiddleware,
);
router.all('/content/:content_id', MediaAccessMiddleware);
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
	UserRegistrationController,
);

/* User: Login */ router.post('/user/login', BasicAuthMiddleware, UserLoginController);

/* User: Logout */ router.post('/user/logout', UserLogoutController);

/* User: About */ router.get('/user/about', UserAccessTokenMiddleware, AboutUserController);

/* Content: All */ router.get('/content', AllMediaController);

/* Content: About */ router.get('/content/:content_id/about', AboutContentController);

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
