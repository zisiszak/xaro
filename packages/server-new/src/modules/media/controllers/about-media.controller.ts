import { type RequestHandler } from 'express';
import { UserRoleEnum } from '~/modules/user/user-role.js';
import { Media } from '../Media.js';
import { type FullMediaRecord } from '../model.js';

export type Status200_Success = FullMediaRecord;
export type Status404_NotFound = never;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ResponseBody = Status200_Success | Status404_NotFound;

export const aboutMediaController: RequestHandler<any, ResponseBody> = async (req, res) => {
	const aboutMedia = await Media.getAboutMedia(
		req.mediaID!,
		req.userAccessToken!.role === UserRoleEnum.Admin ? undefined : req.userAccessToken!.userID,
	);

	if (!aboutMedia) return void res.status(404).end();

	return res.status(200).json(aboutMedia).end();
};
