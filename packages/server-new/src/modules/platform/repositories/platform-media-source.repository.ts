import { database } from '~/index.js';
import { type TableInsertion } from '~/modules/database.schema.js';
import { findByID, insert } from '~/shared/index.js';
import { type PlatformContentMetadata, type PlatformMediaSourceRecord } from '../models/index.js';

interface UpdateData {
	platformCommunityID?: number | null;
	platformProfileID?: number | null;
	metadata?: PlatformContentMetadata;
	sourceUrl?: string | null;
}
type OptionalInsertionData = UpdateData;

const insertionDataToInsertable = (
	platformID: number,
	sourceId: string,
	{
		platformCommunityID = null,
		platformProfileID = null,
		metadata = {},
		sourceUrl = null,
	}: OptionalInsertionData = {},
): TableInsertion<'PlatformMediaSource'> => ({
	platformID,
	sourceId,
	platformCommunityID,
	platformProfileID,
	sourceUrl,
	metadata: JSON.stringify(metadata),
});

export interface PlatformMediaSourceRepository {
	save(platformID: number, sourceId: string, data?: OptionalInsertionData): Promise<number>;

	findByID(platformMediaSourceID: number): Promise<PlatformMediaSourceRecord | undefined>;

	findBySourceID(
		platformID: number,
		sourceID: string,
	): Promise<PlatformMediaSourceRecord | undefined>;
}

export const platformMediaSourceRepository: PlatformMediaSourceRepository = {
	async findByID(platformMediaSourceID) {
		return findByID('PlatformMediaSource', platformMediaSourceID);
	},
	async findBySourceID(platformID: number, sourceId: string) {
		return database
			.selectFrom('PlatformMediaSource')
			.selectAll()
			.where((eb) => eb.and({ platformID, sourceId }))
			.executeTakeFirst();
	},
	async save(platformID, sourceId, data) {
		return insert('PlatformMediaSource', insertionDataToInsertable(platformID, sourceId, data));
	},
};
