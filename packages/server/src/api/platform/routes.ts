import { Router } from 'express';
import { AuthorizeUserAccessTokenMiddleware } from '../user/middleware_AuthorizeUserAccessToken.js';
import { AddPlatformController } from './controller_AddPlatform.js';
import { ExtractPlatformContentController } from './controller_ExtractPlatformContent.js';
import { GetAboutPlatformController } from './controller_GetAboutPlatform.js';
import { GetAboutPlatformCommunityController } from './controller_GetAboutPlatformCommunity.js';
import { GetAboutPlatformProfileController } from './controller_GetAboutPlatformProfile.js';
import { GetAllPlatformCommunitiesController } from './controller_GetAllPlatformCommunities.js';
import { GetAllPlatformProfilesController } from './controller_GetAllPlatformProfiles.js';
import { GetAllPlatformsController } from './controller_GetAllPlatforms.js';
import { AuthorizePlatformAccessMiddleware } from './middleware_AuthorizePlatformAccess.js';

const router = Router();
router.all('*', AuthorizeUserAccessTokenMiddleware);

router.get('/all', GetAllPlatformsController);
router.post('/add', AddPlatformController);
router.post(
	'/extract/content/:platformName',
	AuthorizePlatformAccessMiddleware,
	ExtractPlatformContentController,
);
router.get(
	'/about/:platformName',
	AuthorizePlatformAccessMiddleware,
	GetAboutPlatformController,
);

router.get(
	'/profile/all/:platformName',
	AuthorizePlatformAccessMiddleware,
	GetAllPlatformProfilesController,
);
router.get('/profile/about/:profileId', GetAboutPlatformProfileController);
// TODO: Implement
router.get(
	'/profile/about/:platformName.:profileName',
	AuthorizePlatformAccessMiddleware,
);

router.get(
	'/community/all/:platformName',
	AuthorizePlatformAccessMiddleware,
	GetAllPlatformCommunitiesController,
);
router.get(
	'/community/about/:communityId',
	GetAboutPlatformCommunityController,
);

// router.all('/:platformName/*', AuthorizePlatformAccessMiddleware);
// router.post('/:platformName/extract/content', ExtractPlatformContentController);
// router.get('/:platformName/about', GetAboutPlatformController);
// router.get('/:platformName/profiles', GetLinkedPlatformProfilesController);
// router.get(
// 	'/:platformName/profiles/:profileId/about',
// 	GetAboutPlatformProfileController,
// );
// router.get(
// 	'/:platformName/communities/:communityId/about',
// 	GetAboutPlatformCommunityController,
// );
// router.get(
// 	'/:platformName/communities',
// 	GetLinkedPlatformCommunitiesController,
// );

export const platformRouter = router as Router;
