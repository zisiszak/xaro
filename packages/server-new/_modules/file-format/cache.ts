import { defaultFileFormats } from './defaults.js';
import { type FileFormatDto } from './model.js';

const fileFormatExtensionMap: Map<string, FileFormatDto[]> = new Map();
const fileFormatIDMap: Map<number, FileFormatDto> = new Map();

// TEMPORARY
Object.values(defaultFileFormats).map((fileFormat) => {
	fileFormatIDMap.set(fileFormat.id, fileFormat);
	fileFormat.extensions.forEach((ext) => {
		const list = fileFormatExtensionMap.get(ext) ?? [];
		list.push(fileFormat);
		fileFormatExtensionMap.set(ext, list);
	});
});

export const findAllByExtension = (ext: string): [FileFormatDto, ...FileFormatDto[]] | undefined =>
	fileFormatExtensionMap.get(ext) as [FileFormatDto, ...FileFormatDto[]] | undefined;

export const findByID = (id: number): FileFormatDto | undefined => fileFormatIDMap.get(id);
