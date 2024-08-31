import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { checkExistsByColumn, findByColumn, findByID, insertRow } from '~/shared/database/utils.js';
import { type UserRecord } from '../models/index.js';
import { UserTable } from '../tables/user.table.js';

export interface UserRepository {
	save(user: TableInsertion<'User'>): Promise<number>;

	findByID(userID: number): Promise<UserRecord | undefined>;

	findByUsername(username: string): Promise<UserRecord | undefined>;

	exists(username: string): Promise<boolean>;
}

const TABLE = UserTable.name;

const rowToRecord = ({
	passwordHash,
	passwordSalt,
	...rest
}: TableSelection<'User'>): UserRecord => ({
	...rest,
	usesAuthentication: passwordHash !== null && passwordSalt !== null,
});

export const userRepository: UserRepository = {
	async findByID(userID) {
		const user = await findByID(TABLE, userID);
		if (!user) return undefined;
		return rowToRecord(user);
	},
	async findByUsername(username) {
		const user = await findByColumn(TABLE, 'username', username);
		if (!user) return undefined;
		return rowToRecord(user);
	},

	async exists(username) {
		return checkExistsByColumn(TABLE, 'username', username);
	},

	async save(user) {
		return insertRow('User', user);
	},
};
