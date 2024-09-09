import { type Insertable, type Selectable } from 'kysely';
import { checkExistsByColumn, findByColumn, findByID, insertRow } from '~/shared/database/utils.js';
import { type UserTableSchema } from './sqlite.table.js';

export interface UserRepository {
	save: (user: Insertable<UserTableSchema>) => Promise<number>;

	findByID: (userID: number) => Promise<Selectable<UserTableSchema> | undefined>;

	findByUsername: (username: string) => Promise<Selectable<UserTableSchema> | undefined>;

	isUsernameTaken: (username: string) => Promise<boolean>;
}

export const userRepository: UserRepository = {
	findByID: async (userID) => findByID('User', userID),
	findByUsername: async (username) => findByColumn('User', 'username', username),
	isUsernameTaken: async (username) => checkExistsByColumn('User', 'username', username),
	save: async (user) => insertRow('User', user),
};
