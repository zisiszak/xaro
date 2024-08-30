import { unixEpochNow } from '~/shared/index.js';
import { type TableProtocolSchema } from './types.js';

export const identifiable: TableProtocolSchema<'Identifiable'> = {
	name: 'Identifiable',
	columns: [['id', 'integer', (cb) => cb.notNull().primaryKey().autoIncrement().unique()]],
};

export const autoDateAdded: TableProtocolSchema<'AutoDateAdded'> = {
	name: 'AutoDateAdded',
	columns: [['dateAdded', 'timestamp', (cb) => cb.notNull().defaultTo(unixEpochNow)]],
};

export const trashable: TableProtocolSchema<'Trashable'> = {
	name: 'Trashable',
	columns: [['dateTrashed', 'timestamp', (cb) => cb.defaultTo(null)]],
};
