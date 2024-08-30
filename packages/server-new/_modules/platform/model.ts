export * from './platform-content-metadata.js';

export interface PlatformDto {
	id: number;
	name: string;
	displayName: string;
	homeUrl: string;
	description: string | null;
}

export type InsertablePlatformDto = Partial<PlatformDto> &
	Pick<PlatformDto, 'name' | 'displayName' | 'homeUrl'>;
