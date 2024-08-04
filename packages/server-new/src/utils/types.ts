import { type ColumnType } from 'kysely';

/** UTC seconds */
export type DateAddedColumn = ColumnType<number, number | undefined, never>;
