export interface PlatformCommunityDto {
	id: number;
	platformID: number;
	name: string;
	sourceId: string;
	sourceUrl: string;
	displayName: string;
	description: string | null;
	metadata: unknown;
	dateAdded: Date;
}

export type InsertablePlatformCommunityDto = Partial<PlatformCommunityDto> &
	Pick<PlatformCommunityDto, 'name' | 'platformID' | 'sourceId' | 'sourceUrl' | 'displayName'>;
