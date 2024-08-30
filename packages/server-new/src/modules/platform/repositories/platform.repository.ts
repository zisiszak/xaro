import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { findByColumn, findByID, insertRow } from '~/shared/index.js';

export interface PlatformRepository {
	findByID(platformID: number): Promise<TableSelection<'Platform'> | undefined>;
	findByName(platformName: string): Promise<TableSelection<'Platform'> | undefined>;
	save(platform: TableInsertion<'Platform'>): Promise<number>;
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
