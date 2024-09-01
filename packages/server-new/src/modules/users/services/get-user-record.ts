import { logger } from '~/index.js';
import { type TableSelection } from '~/modules/database.schema.js';
import { type UserRecord } from '../model/records.js';
import { userRepository } from '../repositories/user.repository.js';

const rowToRecord = ({
	passwordHash,
	passwordSalt,
	...rest
}: TableSelection<'User'>): UserRecord => ({
	...rest,
	usesAuthentication: passwordHash !== null && passwordSalt !== null,
});

export const getUserRecord = async (id: number): Promise<UserRecord | null> => {
	const user = await userRepository.findByID(id);

	if (!user) {
		logger.error(`Could not get user info for user id: ${id} - ID not found in database.`);
		return null;
	}

	return rowToRecord(user);
};
