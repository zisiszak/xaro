import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { checkExistsByColumn, findByColumn, findByID, insertRow } from '~/shared/database/utils.js';
import { UserTable } from '../tables/user.table.js';

export interface UserRepository {
	save: (user: TableInsertion<'User'>) => Promise<number>;

	findByID: (userID: number) => Promise<TableSelection<'User'> | undefined>;

	findByUsername: (username: string) => Promise<TableSelection<'User'> | undefined>;

	isUsernameTaken: (username: string) => Promise<boolean>;
}

const TABLE = UserTable.name;

export const userRepository: UserRepository = {
	findByID: async (userID) => findByID(TABLE, userID),
	findByUsername: async (username) => findByColumn(TABLE, 'username', username),
	isUsernameTaken: async (username) => checkExistsByColumn(TABLE, 'username', username),
	save: async (user) => insertRow(TABLE, user),
};
