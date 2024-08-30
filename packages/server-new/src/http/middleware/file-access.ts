import { type RequestHandler } from 'express';
import { fileRepository } from '~/modules/files/index.js';
import { userRepository } from '~/modules/users/index.js';
import { cleanInt } from '~/utils/sanitise.js';

export const RequireFileAccessViaID: RequestHandler<
	{
		fileID?: unknown;
	},
	unknown,
	{ fileID?: unknown },
	{ fileID?: unknown }
> = async (req, res, next) => {
	const userAccessToken = req.userAccessToken!;

	const fileID = cleanInt(req.params.fileID ?? req.body.fileID ?? req.query.fileID);
	if (typeof fileID === 'undefined') return void res.status(404).end();

	if (userAccessToken.role === 'admin') {
		req.fileID = fileID;
		next();
		return;
	}

	const access = await userRepository.getOriginalFsFileLink(userAccessToken.id, fileID);
	if (!access) return void res.status(401).end();

	req.fileID = fileID;
	next();
};

export const RequireFileAccessViaFilePath: RequestHandler = async (req, res, next) => {
	const userAccessToken = req.userAccessToken!;

	const libraryPath = req.originalUrl.slice(16);
	if (libraryPath === '') {
		res.status(404).end();
		return;
	}

	const file = await fileRepository.findByLibraryPath(libraryPath);
	if (!file || !file.libraryPath) return void res.status(404).end();

	if (userAccessToken.role === 'admin') {
		req.fileID = file.id;
		req.fileLibraryPath = file.libraryPath;
		next();
		return;
	}

	const access = await userRepository.getOriginalFsFileLink(userAccessToken.id, file.id);
	if (!access) return void res.status(401).end();

	req.fileID = file.id;
	req.fileLibraryPath = file.libraryPath;
	next();
};
