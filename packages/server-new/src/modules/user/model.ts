import { type UserRole } from './user-role.js';

export interface AboutUser {
	id: number;
	username: string;
	role: UserRole;
	usesAuthentication: boolean;
	dateAdded: number;
}
