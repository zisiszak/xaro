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
