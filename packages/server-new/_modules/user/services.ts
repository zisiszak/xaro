import { UserRepository } from './index.js';
import {
	assertIsUserAuthentication,
	assertIsUserRole,
	assertIsValidUsernameString,
	type InsertableUserDto,
} from './model.js';

export {
	findByID as findUserByID,
	findByUsername as findUserByUsername,
	isUsernameAvailable as isUserUsernameAvailable,
} from './repository.js';

export async function createUser({
	username,
	role,
	authentication,
}: InsertableUserDto): Promise<number> {
	assertIsValidUsernameString(username);
	assertIsUserRole(role);
	if (authentication) assertIsUserAuthentication(authentication);

	return UserRepository.insert({ username, role, authentication });
}
