import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { findByColumn, findByID, insertRow } from '~/shared/index.js';

export interface CreatorRepository {
	findByID(creatorID: number): Promise<TableSelection<'Creator'> | undefined>;
	findByName(name: string): Promise<TableSelection<'Creator'> | undefined>;
	save(creator: TableInsertion<'Creator'>): Promise<number>;
}

export const creatorRepository: CreatorRepository = {
	async findByID(creatorID) {
		return findByID('Creator', creatorID);
	},
	async findByName(name) {
		return findByColumn('Creator', 'displayName', name);
	},
	async save(creator) {
		return insertRow('Creator', creator);
	},
};
