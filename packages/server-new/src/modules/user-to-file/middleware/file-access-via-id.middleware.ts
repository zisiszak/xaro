import { type RequestHandler } from 'express';
import { logger } from '~/index.js';
import { fileRepository } from '~/modules/file/sqlite.repository.js';
import { UserRoleEnum } from '~/modules/user/user-role.js';
import { cleanInt } from '~/utils/sanitise.js';
import { userToFileRepository } from '../sqlite.repository.js';

export const fileAccessViaIDMiddleware: RequestHandler<
	{
		file_id?: unknown;
	},
	unknown,
	{ file_id?: unknown },
	{ file_id?: unknown }
> = async (req, res, next) => {
	const fileID = cleanInt(req.params.file_id ?? req.body.file_id ?? req.query.file_id);
	if (typeof fileID === 'undefined') return void res.status(400).end();

	let originalFileID: number;
	try {
		if (req.userAccessToken!.role === UserRoleEnum.Admin) {
			originalFileID = await fileRepository.resolveOriginalFileID(fileID);
		} else {
			const link = await userToFileRepository.findByAnyFileID(
				req.userAccessToken!.userID,
				fileID,
			);
			if (!link) return void res.status(401).end();

			originalFileID = link.originalFileID;
		}

		req.fileID = fileID;
		req.originalFileID = originalFileID;
		next();
	} catch (err) {
		logger.error({ fileID, error: err }, 'File ID not found in database.');
		return void res.status(404).end();
	}
};
