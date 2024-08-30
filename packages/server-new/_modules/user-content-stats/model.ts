export interface UserContentStatsDto {
	userID: number;
	contentID: number;
	hasBeenSeen: boolean;
	playCount: number;
	lastPlayhead: number | null;
	dateLastPlayed: Date | null;
	isFavourite: boolean;
	rating: number | null;
}

export type InsertableUserContentStatsDto = Partial<UserContentStatsDto> &
	Pick<UserContentStatsDto, 'contentID' | 'userID'>;
