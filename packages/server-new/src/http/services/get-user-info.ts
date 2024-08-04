import { xaro } from '~/index.js';
import { Users } from '~/models/database/tables/index.js';
import { type UserRole } from '~/models/database/tables/users.js';

export interface UserInfo {
	id: number;
	role: UserRole;
	username: string;
	date_added: number;
	no_password: boolean;
}
export async function getUserInfo(id: number): Promise<UserInfo | null> {
	const user = await Users.readEntryWhereID(id);

	if (!user) {
		xaro.log.error(`Could not get user info for user id: ${id} - ID not found in database.`);

		return null;
	}

	return {
		id,
		username: user.username,
		role: user.role,
		no_password: !(!!user.password_hash || !!user.password_salt),
		date_added: user.date_added,
	};
}
