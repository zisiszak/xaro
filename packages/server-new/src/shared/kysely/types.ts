import { type ColumnBuilderCallback, type ColumnDataType, type Expression } from 'kysely';

export type ColumnDefinition<CN extends string> = [
	columnName: CN,
	dataType: ColumnDataType | Expression<any>,
	build?: ColumnBuilderCallback,
];
