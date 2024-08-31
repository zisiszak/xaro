import { type TableInsertion } from '~/modules/database.schema.js';
import { findByColumn, findByID, insertRow } from '~/shared/index.js';
import { type CreatorRecord } from '../models/records.js';

export interface CreatorRepository {
	save(creator: TableInsertion<'Creator'>): Promise<number>;

	findByID(creatorID: number): Promise<CreatorRecord | undefined>;

	findByName(creatorName: string): Promise<CreatorRecord | undefined>;
}

export const creatorRepository: CreatorRepository = {
	async save(creator) {
		return insertRow('Creator', creator);
	},
	async findByID(creatorID) {
		return findByID('Creator', creatorID);
	},
	async findByName(name) {
		return findByColumn('Creator', 'displayName', name);
	},
};
