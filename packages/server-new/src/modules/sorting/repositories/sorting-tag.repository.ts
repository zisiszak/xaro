import { xaro } from '~/index.js';
import { type TableSelection } from '~/modules/database.schema.js';
import { findByColumn, findByID, insert } from '~/shared/database/utils.js';

type SortingTagSelection = TableSelection<'SortingTag'>;
type SortingTagInsertion = TableSelection<'SortingTag'>;

export interface SortingTagRepository {
	findByID(sortingTagID: number): Promise<SortingTagSelection | undefined>;
	findByName(name: string): Promise<SortingTagSelection | undefined>;
	findIDByName(name: string): Promise<number | undefined>;
	save(value: SortingTagInsertion): Promise<number>;
	update(
		sortingTagID: number,
		update: {
			description?: string | null;
			name?: string;
		},
	): Promise<undefined>;

	remove(sortingTagID: number): Promise<undefined>;
	remove(name: string): Promise<undefined>;
}

export const sortingTagRepository: SortingTagRepository = {
	async findIDByName(name) {
		return xaro.db
			.selectFrom('SortingTag')
			.select('id')
			.where('name', '=', name)
			.executeTakeFirst()
			.then((result) => result?.id);
	},
	async findByID(sortingTagID) {
		return findByID('SortingTag', sortingTagID);
	},
	async findByName(name) {
		return findByColumn('SortingTag', 'name', name);
	},
	async save(sortingTag) {
		return insert('SortingTag', sortingTag);
	},

	async update(sortingTagID, update) {
		return xaro.db
			.updateTable('SortingTag')
			.set(update)
			.where('id', '=', sortingTagID)
			.executeTakeFirst()
			.then(() => undefined);
	},
	async remove(idOrName) {
		const column = typeof idOrName === 'string' ? ('name' as const) : ('id' as const);
		return xaro.db
			.deleteFrom('SortingTag')
			.where(column, '=', idOrName)
			.executeTakeFirst()
			.then(() => undefined);
	},
};
