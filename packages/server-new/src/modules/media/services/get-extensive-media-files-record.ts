import {
	FileToMediaRelationshipEnum,
	type FileToMediaRelationship,
	type MediaFilesRecord,
} from '../models/index.js';
import { mediaRepository } from '../repositories/media.repository.js';

const relationshipToRecordKeyMap: Record<FileToMediaRelationship, keyof MediaFilesRecord> = {
	[FileToMediaRelationshipEnum.Media]: 'media',
	[FileToMediaRelationshipEnum.VideoPreview]: 'videoPreview',
	[FileToMediaRelationshipEnum.Thumbnail]: 'thumbnail',
	[FileToMediaRelationshipEnum.Subtitles]: 'subtitles',
	[FileToMediaRelationshipEnum.Metadata]: 'metadata',
	[FileToMediaRelationshipEnum.Dump]: 'dump',
};

export const getExtensiveMediaFilesRecord = async (
	mediaID: number,
	userID?: number,
): Promise<MediaFilesRecord> => {
	const files = await mediaRepository.getAllLinkedFiles(mediaID, { linkedUserID: userID });
	const record: MediaFilesRecord = {};

	files.forEach((file) => {
		const key = relationshipToRecordKeyMap[file.mediaRelationship];
		record[key] ??= [];
		record[key].push(file);
	});

	return record;
};
