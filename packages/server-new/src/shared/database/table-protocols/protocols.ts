import { type ColumnType, type Generated } from 'kysely';

export interface Identifiable {
	id: Generated<number>;
}

export interface AutoDateAdded {
	dateAdded: Generated<number>;
}

export interface Trashable {
	dateTrashed: ColumnType<number | null, undefined | null>;
}
