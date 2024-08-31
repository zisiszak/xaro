import { type TableInsertion } from '~/modules/database.schema.js';
import { findByColumn, findByID, insertRow } from '~/shared/index.js';
import { type PlatformRecord } from '../models/index.js';

export interface PlatformRepository {
	save(platform: TableInsertion<'Platform'>): Promise<number>;

	findByID(platformID: number): Promise<PlatformRecord | undefined>;

	findByName(platformName: string): Promise<PlatformRecord | undefined>;
}

export const platformRepository: PlatformRepository = {
	async findByID(platformID) {
		return findByID('Platform', platformID);
	},
	async findByName(platformName) {
		return findByColumn('Platform', 'displayName', platformName);
	},
	async save(platform) {
		return insertRow('Platform', platform);
	},
};
