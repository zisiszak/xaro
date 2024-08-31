import { type UserRole } from './user.model.js';

export interface UserRecord {
	id: number;
	username: string;
	role: UserRole;
	usesAuthentication: boolean;
	dateAdded: number;
}

export interface UserMediaStatsRecord {
	userID: number;
	mediaID: number;
	seen: boolean;
	playCount: number;
	lastPlayhead: number | null;
	dateLastPlayed: number | null;
	isFavourite: boolean;
	rating: number | null;
}
