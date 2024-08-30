import { type UserAuthentication } from './user-authentication.js';
import { type UserRole } from './user-role.js';

export * from './user-access-token.js';
export * from './user-authentication.js';
export * from './user-role.js';
export * from './user-username.js';

export interface UserDto {
	id: number;
	username: string;
	role: UserRole;
	authentication?: UserAuthentication;
	dateAdded: Date;
}

export type InsertableUserDto = Omit<UserDto, 'id' | 'dateAdded'>;
