import { type TableInsertion } from '~/modules/database.schema.js';
import { findByColumn, findByID, insertRow } from '~/shared/index.js';
import { type PlatformCommunityRecord } from '../models/records.js';
import { PlatformCommunityTable } from '../tables/platform-community.table.js';

export interface PlatformCommunityRepository {
	save(platformCommunity: TableInsertion<'PlatformCommunity'>): Promise<number>;

	findByID(id: number): Promise<PlatformCommunityRecord | undefined>;

	findByName(name: string): Promise<PlatformCommunityRecord | undefined>;
}

const TABLE = PlatformCommunityTable.name;

export const platformCommunityRepository: PlatformCommunityRepository = {
	async findByID(platformCommunityID) {
		return findByID(TABLE, platformCommunityID);
	},
	async findByName(name) {
		return findByColumn(TABLE, 'displayName', name);
	},
	async save(platformCommunity) {
		return insertRow(TABLE, platformCommunity);
	},
};
