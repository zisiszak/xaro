import { type Selectable } from 'kysely';
import path from 'path';
import { xaro } from '~/index.js';
import { newReadonlyCache } from '~/utils/index.js';
import { Db } from '../database/index.js';

export type PossibleFileFormats = Readonly<Readonly<Db.FileFormats.Selection>[]>;

export const fileFormatMap = newReadonlyCache<Map<string, PossibleFileFormats>>(
	() =>
		xaro.db
			.selectFrom(Db.FileFormats.name)
			.selectAll()
			.execute()
			.then((results) => {
				const map = new Map<string, PossibleFileFormats>();
				results.forEach((result) => {
					result.extensions.forEach((ext) => {
						const mapped = map.get(ext);
						if (mapped) {
							(mapped as Selectable<Db.FileFormats.Selection>[]).push(result);
						} else {
							map.set(ext, [result]);
						}
					});
				});
				return map;
			}),
	'FileFormats',
);

interface FileFormatInfo {
	ext: string;
	formats: PossibleFileFormats;
}
export async function getFileFormatInfo(filePath: string): Promise<FileFormatInfo> {
	if (!fileFormatMap.data) {
		await fileFormatMap.sync().then((err) => {
			if (err) {
				xaro.exit('Fatal error: File format map could not be synced.', err);
			}
		});
	}

	const ext = path.extname(filePath);

	return {
		ext,
		formats: fileFormatMap.data?.get(ext) ?? [],
	};
}
