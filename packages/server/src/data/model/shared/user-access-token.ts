import { createGuard, is } from 'is-guard';
import { isUserRole, type UserRole } from '../tables/User.js';

export const userAccessTokenKey = 'user-access-token';

export type UserAccessTokenPayload = {
	id: number;
	username: string;
	role: UserRole;
	expiry: number;
};
export const isUserAccessTokenPayload =
	createGuard.objectWithProps<UserAccessTokenPayload>({
		// jwt includes a few of its own properties, so we need to allow extra keys
		noExtraKeys: false,
		required: {
			id: is.number,
			username: is.string,
			role: isUserRole,
			expiry: is.number,
		},
	});
