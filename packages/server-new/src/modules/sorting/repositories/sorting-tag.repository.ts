import { database } from '~/index.js';
import { type TableSelection } from '~/modules/database.schema.js';
import { findByColumn, findByID, insert } from '~/shared/database/utils.js';
import { SortingTagTable } from '../tables/sorting-tag.table.js';

type SortingTagSelection = TableSelection<'SortingTag'>;
type SortingTagInsertion = TableSelection<'SortingTag'>;

interface UpdateData {
	description?: string | null;
	name?: string;
}

export interface SortingTagRepository {
	save(value: SortingTagInsertion): Promise<number>;

	update(sortingTagID: number, data: UpdateData): Promise<void>;

	remove(sortingTagID: number): Promise<void>;
	remove(name: string): Promise<void>;

	findByID(sortingTagID: number): Promise<SortingTagSelection | undefined>;

	findByName(name: string): Promise<SortingTagSelection | undefined>;

	resolveIDFromName(name: string): Promise<number | undefined>;
}

const TABLE = SortingTagTable.name;

export const sortingTagRepository: SortingTagRepository = {
	async resolveIDFromName(name) {
		return database
			.selectFrom(TABLE)
			.select('id')
			.where('name', '=', name)
			.limit(1)
			.executeTakeFirst()
			.then((result) => result?.id);
	},
	async findByID(sortingTagID) {
		return findByID(TABLE, sortingTagID);
	},
	async findByName(name) {
		return findByColumn(TABLE, 'name', name);
	},
	async save(sortingTag) {
		return insert(TABLE, sortingTag);
	},

	async update(sortingTagID, update) {
		return database
			.updateTable(TABLE)
			.set(update)
			.where('id', '=', sortingTagID)
			.executeTakeFirst()
			.then(() => undefined);
	},
	async remove(idOrName) {
		const column = typeof idOrName === 'string' ? ('name' as const) : ('id' as const);
		return database
			.deleteFrom(TABLE)
			.where(column, '=', idOrName)
			.executeTakeFirst()
			.then(() => undefined);
	},
};
