import { createGuard, is } from 'is-guard';
import { type UserRole, isUserRole } from '../user-role.js';

export interface UserAccessTokenPayload {
	userID: number;
	username: string;
	role: UserRole;
	expiry: number;
}
export const isUserAccessTokenPayload = createGuard.objectWithProps<UserAccessTokenPayload>({
	// jwt includes a few of its own properties, so we need to allow extra keys
	noExtraKeys: false,
	required: {
		userID: is.number,
		username: is.string,
		role: isUserRole,
		expiry: is.number,
	},
});
