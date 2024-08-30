export interface PlatformProfileDto {
	id: number;
	platformID: number;
	creatorID: number;
	name: string;
	displayName: string;
	description: string | null;
	sourceId: string;
	sourceUrl: string;
	metadata: object | Array<unknown> | null;
	dateAdded: Date;
}

export type InsertablePlatformProfileDto = Partial<PlatformProfileDto> &
	Pick<
		PlatformProfileDto,
		'name' | 'creatorID' | 'platformID' | 'sourceId' | 'sourceUrl' | 'displayName'
	>;
