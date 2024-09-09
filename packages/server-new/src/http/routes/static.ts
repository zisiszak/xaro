import { Router, static as expressStatic } from 'express';
import { join } from 'path';
import { fileRepository } from '~/modules/file/sqlite.repository.js';
import {
	fileAccessViaIDMiddleware,
	staticFileAccessMiddleware,
} from '~/modules/user-to-file/index.js';
import { userAccessTokenMiddleware } from '~/modules/user/index.js';

export const createStaticRouter = (): Router => {
	const router = Router();

	const staticMiddleware = expressStatic(join(process.env.ROOT_DIRECTORY, 'files'), {
		cacheControl: true,
		fallthrough: false,
		index: false,
		setHeaders: (res) => {
			res.setHeader('Cache-Control', 'public, max-age=31536000');
		},
	});

	router.use('/file', userAccessTokenMiddleware, staticFileAccessMiddleware, staticMiddleware);

	router.get(
		'/file-id/:file_id',
		userAccessTokenMiddleware,
		fileAccessViaIDMiddleware,
		async (req, _res, next) => {
			const libraryPath = await fileRepository.resolveLibraryPathFromID(req.fileID!);
			req.url = `/${libraryPath}`;
			next();
		},
		staticMiddleware,
	);

	return router;
};
