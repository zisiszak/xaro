import { type JSONColumnType } from 'kysely';
import {
	type DatabaseTable,
	type TableProtocol,
	compileTableSchemaQuery,
	referenceForeignTableID,
} from '~/shared/index.js';

export interface MediaTableSchema
	extends TableProtocol.Identifiable,
		TableProtocol.AutoDateAdded,
		TableProtocol.Trashable {
	platformMediaSourceID: number | null;
	// eslint-disable-next-line @typescript-eslint/ban-types
	metadata: JSONColumnType<{}, string | undefined>;
}

export const MediaTable: DatabaseTable<'Media'> = {
	name: 'Media',
	compiledCreateTableQuery: compileTableSchemaQuery<MediaTableSchema>(
		'Media',
		['AutoDateAdded', 'Identifiable', 'Trashable'],
		null,
		[
			'platformMediaSourceID',
			'integer',
			(cb) =>
				cb
					.unique()
					.references(referenceForeignTableID('PlatformMediaSource'))
					.onDelete('set null')
					.onUpdate('cascade'),
		],
		['metadata', 'json', (cb) => cb.defaultTo('{}')],
	),
};
