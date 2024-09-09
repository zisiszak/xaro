import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { findByColumn, findByID, insertRow } from '~/shared/index.js';

export interface CreatorRepository {
	save(creator: TableInsertion<'Creator'>): Promise<number>;

	findByID(creatorID: number): Promise<TableSelection<'Creator'> | undefined>;

	findByName(creatorName: string): Promise<TableSelection<'Creator'> | undefined>;
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
