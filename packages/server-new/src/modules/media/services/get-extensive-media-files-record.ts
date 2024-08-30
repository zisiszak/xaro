import {
	type OriginalFileToMediaRelationship,
	OriginalFileToMediaRelationshipEnum,
} from '~/modules/files/index.js';
import { type MediaFilesRecord } from '../models/media.model.js';
import { mediaRepository } from '../repositories/media.repository.js';

const relationshipToRecordKeyMap: Record<OriginalFileToMediaRelationship, keyof MediaFilesRecord> =
	{
		[OriginalFileToMediaRelationshipEnum.Media]: 'media',
		[OriginalFileToMediaRelationshipEnum.VideoPreview]: 'videoPreview',
		[OriginalFileToMediaRelationshipEnum.Thumbnail]: 'thumbnail',
		[OriginalFileToMediaRelationshipEnum.Subtitles]: 'subtitles',
		[OriginalFileToMediaRelationshipEnum.Metadata]: 'metadata',
		[OriginalFileToMediaRelationshipEnum.Dump]: 'dump',
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
