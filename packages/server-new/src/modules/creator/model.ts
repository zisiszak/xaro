export type CreatorAliases = string[];

export interface CreatorRecord {
	id: number;
	name: string;
	displayName: string;
	aliases: string[];
	dateAdded: number;
}
