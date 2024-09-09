import { type RequestHandler } from 'express';
import { logger } from '~/index.js';
import { User } from '../User.js';
import { type AboutUser } from '../model.js';

export interface Status500_UserNotFound {}
export interface Status200_Success extends AboutUser {}

export type ResponseBody = Status500_UserNotFound | Status200_Success;

export const aboutUserController: RequestHandler<never, ResponseBody> = async (req, res) => {
	try {
		const userRecord = await User.getAboutUser(req.userAccessToken!.userID);
		if (!userRecord)
			throw {
				message: 'UserRecord not found, even though an access token was provided.',
				context: {
					userID: req.userAccessToken!.userID,
				},
			};

		res.status(200).json(userRecord).end();
	} catch (err) {
		logger.error(err);
		res.status(500).end();
	}
};
