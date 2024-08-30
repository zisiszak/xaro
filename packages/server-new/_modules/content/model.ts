import { type PlatformContentMetadata } from '~/_modules/platform/index.js';

export interface ContentDto {
	id: number;
	metadata: PlatformContentMetadata | null;
	platformID: number | null;
	platformCommunityID: number | null;
	platformSourceId: string | null;
	platformSourceUrl: string | null;
	dateAdded: Date;
}

export type InsertableContentDto = Partial<ContentDto>;
