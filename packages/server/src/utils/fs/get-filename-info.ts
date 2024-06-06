import { basename, extname } from 'path';

export interface FilenameInfo<Kind extends string, Extension extends string> {
	kind: Kind;
	ext: Extension;
	basename: string;
}
type UnsupportedFilenameInfo = FilenameInfo<'unsupported', string>;

export type FileKindExtensionMap<
	Extension extends string,
	Kind extends string,
> = Record<Extension, Kind>;

export function parseFilename<Kind extends string, Extension extends string>(
	file: string,
	extensionMap: FileKindExtensionMap<Extension, Kind>,
) {
	const ext = extname(file);
	const base = basename(file, ext);
	return {
		kind:
			ext in extensionMap
				? (extensionMap[ext as Extension] as Kind)
				: ('unsupported' as const),
		ext,
		basename: base,
	} as FilenameInfo<Kind, Extension> | UnsupportedFilenameInfo;
}
