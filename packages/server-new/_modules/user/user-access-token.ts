import { createGuard, is } from 'is-guard';
import { isUserRole, type UserRole } from './user-role.js';

export const USER_ACCESS_TOKEN_KEY = 'user_access_token';
/** In milliseconds, relative to time first signed */
export const USER_ACCESS_TOKEN_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7;

export interface UserAccessTokenPayload {
	id: number;
	username: string;
	role: UserRole;
	expiry: number;
}
export const isUserAccessTokenPayload = createGuard.objectWithProps<UserAccessTokenPayload>({
	// jwt includes a few of its own properties, so we need to allow extra keys
	noExtraKeys: false,
	required: {
		id: is.number,
		username: is.string,
		role: isUserRole,
		expiry: is.number,
	},
});
