import { type RequestHandler } from 'express';
import { getUserInfo, type UserInfo } from '../services/index.js';

export const GetUserInfoController: RequestHandler<never, UserInfo> = async (req, res) => {
	const { id } = req.userAccessToken!;

	const userInfo = await getUserInfo(id);
	if (!userInfo) {
		res.status(404).end();
		return;
	}

	res.status(200).json(userInfo).end();
};
