import { type RequestHandler } from 'express';
import { type BasicUserRecord, getBasicUserRecord } from '~/modules/users/index.js';

export const AboutUserController: RequestHandler<never, BasicUserRecord> = async (req, res) => {
	const userInfo = await getBasicUserRecord(req.userAccessToken!.id);
	if (!userInfo) return void res.status(404).end();
	res.status(200).json(userInfo).end();
};
