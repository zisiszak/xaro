export interface CreatorDto {
	id: number;
	name: string;
	displayName: string;
	aliases: string[];
}

export type InsertableCreatorDto = Partial<CreatorDto> & Pick<CreatorDto, 'name' | 'displayName'>;
