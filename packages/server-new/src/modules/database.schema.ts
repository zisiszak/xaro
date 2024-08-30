import type { Insertable, Kysely, Selectable, Updateable } from 'kysely';
import type { TableProtocol } from '~/shared/index.js';
import type {
	CreatorTable,
	CreatorTableSchema,
	FileFormatTable,
	FileFormatTableSchema,
	FileTable,
	FileTableSchema,
	FileToMediaTable,
	FileToMediaTableSchema,
	MediaTable,
	MediaTableSchema,
	MediaToSortingTagTable,
	MediaToSortingTagTableSchema,
	PlatformCommunityTable,
	PlatformCommunityTableSchema,
	PlatformMediaSourceTable,
	PlatformMediaSourceTableSchema,
	PlatformProfileTable,
	PlatformProfileTableSchema,
	PlatformTable,
	PlatformTableSchema,
	SortingTagTable,
	SortingTagTableSchema,
	UserMediaStatsTable,
	UserMediaStatsTableSchema,
	UsersToPlatformsTable,
	UserTable,
	UserTableSchema,
	UserToFileTable,
	UserToFileTableSchema,
	UserToMediaTable,
	UserToMediaTableSchema,
	UserToPlatformCommunityTable,
	UserToPlatformCommunityTableSchema,
	UserToPlatformProfileTable,
	UserToPlatformProfileTableSchema,
	UserToPlatformTableSchema,
} from './database.tables.js';

export interface DatabaseSchema {
	[MediaTable.name]: MediaTableSchema;
	[FileFormatTable.name]: FileFormatTableSchema;
	[FileTable.name]: FileTableSchema;
	[FileToMediaTable.name]: FileToMediaTableSchema;
	[CreatorTable.name]: CreatorTableSchema;
	[SortingTagTable.name]: SortingTagTableSchema;
	[MediaToSortingTagTable.name]: MediaToSortingTagTableSchema;
	[PlatformTable.name]: PlatformTableSchema;
	[PlatformCommunityTable.name]: PlatformCommunityTableSchema;
	[PlatformProfileTable.name]: PlatformProfileTableSchema;
	[PlatformMediaSourceTable.name]: PlatformMediaSourceTableSchema;
	[UserTable.name]: UserTableSchema;
	[UserToMediaTable.name]: UserToMediaTableSchema;
	[UserToFileTable.name]: UserToFileTableSchema;
	[UserToPlatformCommunityTable.name]: UserToPlatformCommunityTableSchema;
	[UserToPlatformProfileTable.name]: UserToPlatformProfileTableSchema;
	[UsersToPlatformsTable.name]: UserToPlatformTableSchema;
	[UserMediaStatsTable.name]: UserMediaStatsTableSchema;
}

export type AnyTable = keyof DatabaseSchema;

type Selectables = {
	[K in keyof DatabaseSchema]: Selectable<DatabaseSchema[K]>;
};
type Insertables = {
	[K in keyof DatabaseSchema]: Insertable<DatabaseSchema[K]>;
};
type Updatables = {
	[K in keyof DatabaseSchema]: Updateable<DatabaseSchema[K]>;
};

export type TableSchema<T extends AnyTable> = DatabaseSchema[T];
export type TableSelection<Table extends AnyTable> = Selectables[Table];
export type TableInsertion<Table extends AnyTable> = Insertables[Table];
export type TableUpdate<Table extends AnyTable> = Updatables[Table];

export type IdentifiableTableName = keyof {
	[Table in AnyTable as TableSchema<Table> extends TableProtocol.Identifiable
		? Table
		: never]: any;
};
export type NonIdentifiableTableName = Exclude<AnyTable, IdentifiableTableName>;
export const identifiableTableNames = new Set<IdentifiableTableName>([
	'Media',
	'PlatformMediaSource',
	'Creator',
	'FileFormat',
	'Platform',
	'PlatformCommunity',
	'PlatformProfile',
	'User',
	'SortingTag',
	'File',
]);

export type AutoDateAddedTableName = keyof {
	[Table in AnyTable as TableSchema<Table> extends TableProtocol.AutoDateAdded
		? Table
		: never]: any;
};

export type DatabaseConnection = Kysely<DatabaseSchema>;
