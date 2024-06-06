import { Router } from 'express';
import { AuthorizeUserAccessTokenMiddleware } from '../user/middleware_AuthorizeUserAccessToken.js';
import { GetAboutContentController } from './controller_GetAboutContent.js';
import { GetAllContentController } from './controller_GetAllContent.js';
import { GetContentSortingTagsController } from './controller_GetContentSortingTags.js';
import { GetContentThumbnailFilesController } from './controller_GetContentThumbnailFiles.js';
import { RegisterNewContentUploadController } from './controller_RegisterNewContentUpload.js';
import { UpdateContentItemController } from './controller_UpdateContentItem.js';
import { UploadContentFileController } from './controller_UploadContentFile.js';
import { AuthorizeContentAccessMiddleware } from './middleware_AuthorizeContentAccess.js';

const router = Router();

router.get('/', AuthorizeUserAccessTokenMiddleware, GetAllContentController);
router.get(
	'/sorting-tags',
	AuthorizeUserAccessTokenMiddleware,
	GetContentSortingTagsController,
);

router.all('/upload', AuthorizeUserAccessTokenMiddleware);
router.post('/upload/register-new-upload', RegisterNewContentUploadController);
router.post('/upload/file/:clientFileHash', UploadContentFileController);

router.all(
	'/:contentId/*',
	AuthorizeUserAccessTokenMiddleware,
	AuthorizeContentAccessMiddleware,
);
router.get('/:contentId/about', GetAboutContentController);
router.post('/:contentId/update', UpdateContentItemController);
router.get('/:contentId/files/thumbs', GetContentThumbnailFilesController);

export const contentRouter = router as Router;
