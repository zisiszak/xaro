import { type RequestHandler } from 'express';
import { logger } from '~/index.js';
import { fileRepository } from '~/modules/file/sqlite.repository.js';
import { UserRoleEnum } from '~/modules/user/user-role.js';
import { userToFileRepository } from '../sqlite.repository.js';

// const ROUTE_BASE_LENGTH = '/static/file'.length;

export const staticFileAccessMiddleware: RequestHandler = async (req, res, next) => {
	const libraryPath = req.url.slice(1);
	logger.info(libraryPath);
	if (libraryPath === '') return void res.status(404).end();

	try {
		if (req.userAccessToken!.role === UserRoleEnum.Admin) {
			// Throws if not resolved to a fileID
			await fileRepository.resolveOriginalFileIDFromLibraryPath(libraryPath);
		} else {
			// Also throws if library path doesn't resolve to a fileID
			const link = await userToFileRepository.findByLibraryPath(
				req.userAccessToken!.userID,
				libraryPath,
			);
			if (!link) return void res.status(401).end();
		}

		req.fileLibraryPath = libraryPath;

		next();
	} catch (err) {
		logger.error({ libraryPath }, 'Library path not in database.');
		return void res.status(404).end();
	}
};
