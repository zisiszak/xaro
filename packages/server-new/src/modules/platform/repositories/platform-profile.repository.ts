import { type TableInsertion } from '~/modules/database.schema.js';
import { findByColumn, findByID, insertRow } from '~/shared/index.js';
import { type PlatformProfileRecord } from '../models/records.js';
import { PlatformProfileTable } from '../tables/platform-profile.table.js';

export interface PlatformProfileRepository {
	save(platformProfile: TableInsertion<'PlatformProfile'>): Promise<number>;

	findByID(id: number): Promise<PlatformProfileRecord | undefined>;

	findByName(name: string): Promise<PlatformProfileRecord | undefined>;
}

const TABLE = PlatformProfileTable.name;

export const platformProfileRepository: PlatformProfileRepository = {
	async findByID(platformProfileID) {
		return findByID(TABLE, platformProfileID);
	},
	async findByName(name) {
		return findByColumn(TABLE, 'displayName', name);
	},
	async save(platformProfile) {
		return insertRow(TABLE, platformProfile);
	},
};
