import { type ColumnType } from 'kysely';

/** UTC seconds */
export type DateAddedColumn = ColumnType<number, number | undefined, never>;

export type NonEmptyArray<T> = [T, ...T[]];

export type Resolved<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never;
