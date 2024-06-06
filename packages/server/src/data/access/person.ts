import { db } from '../../index.js';
import { $callInsert, $callSelect } from '../../libs/kysely/index.js';
import { type Person } from '../model/tables/index.js';

/**
 *
 * @param props - Creator to insert
 * @returns id of the creator
 */
export const addCreatorIfNotExists = (
	props: Person.Insertion,
): Promise<number> =>
	db
		.selectFrom('Person')
		.select('Person.id')
		.where('Person.name', '=', props.name)
		.$call($callSelect.first)
		.then((existing) => {
			if (typeof existing !== 'undefined') {
				return existing.id;
			}

			return db
				.insertInto('Person')
				.values(props)
				.$call($callInsert.onConflictThrow) as Promise<number>;
		});
