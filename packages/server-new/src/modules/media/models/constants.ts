export const FileToMediaRelationshipEnum = {
	Media: 1,
	Thumbnail: 10,
	VideoPreview: 20,
	Subtitles: 30,
	Metadata: 40,
	Dump: 99,
} as const;
export type FileToMediaRelationship =
	(typeof FileToMediaRelationshipEnum)[keyof typeof FileToMediaRelationshipEnum];
