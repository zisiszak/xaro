import { type CompiledQuery } from 'kysely';

export type * from './types.value-filters.js';

export interface DatabaseTable<TableName extends string> {
	name: TableName;
	compiledCreateTableQuery: CompiledQuery<unknown>;
}
