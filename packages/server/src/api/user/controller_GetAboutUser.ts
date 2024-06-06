import { type RequestHandler } from 'express';
import { checkForUserCoreParamsErrors } from '~/data/access/user.js';
import { type UserRole } from '../../data/model/tables/User.js';
import { db, logger } from '../../index.js';
import { $callSelect } from '../../libs/kysely/index.js';

export type Success = {
	dateAdded: Date;
	id: number;
	role: UserRole;
	username: string;
	passwordResetRequired: boolean;
	noPassword: boolean;
};
export type Failure = undefined;
export type Result = Success | Failure;

export const GetAboutUserController: RequestHandler<any, Result> = async (
	req,
	res,
) =>
	db
		.selectFrom('User')
		.selectAll()
		.where('id', '=', req.forwarded.user!.id)
		.$call($callSelect.first)
		.then((info) => {
			if (!info) {
				res.status(404).end();
				return;
			}

			const userInfoErrors = checkForUserCoreParamsErrors(info);

			if (Object.keys(userInfoErrors).length > 0) {
				logger.warn(
					{
						id: req.forwarded.user!.id,
						userInfoErrors: userInfoErrors,
					},
					"Error(s) found in user's database record.",
				);
			}

			const passwordResetRequired =
				userInfoErrors.passwordHashMissing === true ||
				userInfoErrors.passwordSaltMissing === true
					? true
					: false;
			const noPassword =
				info.passwordHash === null && info.passwordSalt === null;

			return res
				.status(200)
				.json({
					dateAdded: info.dateAdded,
					id: info.id,
					role: info.role,
					username: info.username,
					passwordResetRequired: passwordResetRequired,
					noPassword,
				})
				.end();
		})
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
					userAccessTokenPayload: req.forwarded.user,
				},
				'getAboutUser: Unhandled exception',
			);
			res.status(500).end();
		});
