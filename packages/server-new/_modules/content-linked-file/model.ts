export type ContentLinkedFileRelationship =
	(typeof ContentLinkedFileRelationshipEnum)[keyof typeof ContentLinkedFileRelationshipEnum];

export const ContentLinkedFileRelationshipEnum = {
	Content: 1,
	Thumbnail: 10,
	Preview: 11,
	Subtitles: 20,
	Metadata: 30,
	Dump: 99,
} as const;

export interface ContentLinkedFileDto {
	fileID: number;
	contentID: number;
	relationship: ContentLinkedFileRelationship;
}

export type InsertableContentLinkedFileDto = ContentLinkedFileDto;
