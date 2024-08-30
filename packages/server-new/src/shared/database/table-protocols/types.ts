import { type ColumnDefinition } from '~/shared/index.js';
import { type AutoDateAdded, type Identifiable, type Trashable } from './protocols.js';

type TableProtocolMap = {
	Identifiable: Identifiable;
	AutoDateAdded: AutoDateAdded;
	Trashable: Trashable;
};
export type TableProtocolName = keyof TableProtocolMap;
export type AnyTableProtocol = TableProtocolMap[TableProtocolName];

export type MatchingTableProtocolName<T> = {
	[K in TableProtocolName]: T extends TableProtocolMap[K] ? K : never;
}[TableProtocolName];

export type TableProtocolColumnName<P extends TableProtocolName> = keyof TableProtocolMap[P] &
	string;

export type TableProtocolSchemaColumnDefinition<P extends TableProtocolName> = ColumnDefinition<
	TableProtocolColumnName<P>
>;

export type TableProtocolSchema<P extends TableProtocolName> = {
	name: P;
	columns: TableProtocolSchemaColumnDefinition<P>[];
};
