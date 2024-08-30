export interface SortingTagDto {
	id: number;
	name: string;
	description: string | null;
}

export type InsertableSortingTagDto = Omit<
	Partial<SortingTagDto> & Pick<SortingTagDto, 'name'>,
	'id'
>;
