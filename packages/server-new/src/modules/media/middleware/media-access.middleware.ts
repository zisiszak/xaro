import { type RequestHandler } from 'express';
import { mediaRepository, userToMediaRepository } from '~/modules/media/index.js';
import { UserRoleEnum } from '~/modules/users/index.js';
import { cleanInt } from '~/utils/sanitise.js';

type Params = {
	media_id: number;
};

export const mediaAccessMiddleware: RequestHandler<Params> = async (req, res, next) => {
	const mediaID = cleanInt(req.params.media_id);
	if (typeof mediaID === 'undefined') return void res.status(400).end();

	const { userID: userID, role: userRole } = req.userAccessToken!;

	let hasAccessAndExists: boolean = false;
	if (userRole === UserRoleEnum.Admin) {
		const media = await mediaRepository.findByID(mediaID);
		if (media) hasAccessAndExists = true;
		else return void res.status(404).end();
	} else {
		const mediaLinkedToUser = await userToMediaRepository.find(userID, mediaID);
		if (mediaLinkedToUser) hasAccessAndExists = true;
	}

	if (hasAccessAndExists) {
		req.mediaID = mediaID;
		next();
	} else return void res.status(401).end();
};
