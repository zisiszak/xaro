import { xaro } from '~/index.js';
import { type UserRole } from '../models/user.model.js';
import { userRepository } from '../repositories/user.repository.js';

export interface BasicUserRecord {
	id: number;
	role: UserRole;
	username: string;
	dateAdded: number;
	usesAuthentication: boolean;
}
export const getBasicUserRecord = async (id: number): Promise<BasicUserRecord | null> => {
	const user = await userRepository.findByID(id);

	if (!user) {
		xaro.log.error(`Could not get user info for user id: ${id} - ID not found in database.`);
		return null;
	}

	return {
		id,
		username: user.username,
		role: user.role,
		usesAuthentication: user.passwordHash !== null || user.passwordSalt !== null,
		dateAdded: user.dateAdded,
	};
};
