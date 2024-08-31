import {
	type PlatformCommunityMetadata,
	type PlatformContentMetadata,
	type PlatformProfileMetadata,
} from './platform.model.js';

export interface PlatformRecord {
	id: number;
	name: string;
	displayName: string;
	homeUrl: string;
	description: string | null;
	/** utc seconds */
	dateAdded: number;
}

export interface PlatformMediaSourceRecord {
	id: number;
	platformID: number;
	platformCommunityID: number | null;
	platformProfileID: number | null;
	metadata: PlatformContentMetadata;
	sourceId: string;
	sourceUrl: string | null;
}

export interface PlatformCommunityRecord {
	id: number;
	platformID: number;
	name: string;
	sourceId: string;
	sourceUrl: string | null;
	displayName: string;
	description: string | null;
	metadata: PlatformCommunityMetadata;
	dateAdded: number;
}

export interface PlatformProfileRecord {
	id: number;
	platformID: number;
	creatorID: number;
	name: string;
	sourceId: string;
	sourceUrl: string | null;
	displayName: string;
	metadata: PlatformProfileMetadata;
}

export interface UserToPlatformRecord {
	userID: number;
	platformID: number;
}

export interface UserToPlatformCommunityRecord {
	userID: number;
	platformCommunityID: number;
}

export interface UserToPlatformProfileRecord {
	userID: number;
	platformProfileID: number;
}
