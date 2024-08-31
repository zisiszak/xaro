import { platformMediaSourceRepository } from '~/modules/platform/index.js';
import { type ExtensiveMediaRecord, type MediaSourceRecord } from '../models/index.js';
import { mediaRepository } from '../repositories/media.repository.js';
import { getExtensiveMediaFilesRecord } from './get-extensive-media-files-record.js';

export const getExtensiveMediaRecord = async (
	mediaID: number,
	userID?: number,
): Promise<ExtensiveMediaRecord> => {
	const mediaRow = await mediaRepository.findByID(mediaID);
	if (!mediaRow) throw 'Media entry not found in database.';

	const tags = await mediaRepository.getAllLinkedSortingTagNames(mediaID);
	const files = await getExtensiveMediaFilesRecord(mediaID, userID);

	let source: MediaSourceRecord;
	if (typeof mediaRow.platformMediaSourceID === 'number') {
		const platformSource = await platformMediaSourceRepository.findByID(
			mediaRow.platformMediaSourceID,
		);
		if (!platformSource) throw 'platform media source missing';

		source = platformSource;
	} else {
		source = {};
	}

	const record: ExtensiveMediaRecord = { ...mediaRow, files, sorting: { tags }, source };
	return record;
};
