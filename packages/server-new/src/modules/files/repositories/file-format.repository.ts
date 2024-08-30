import { xaro } from '~/index.js';
import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { insert } from '~/shared/index.js';
import { type NonEmptyArray } from '~/utils/types.js';
import { type FileExtension } from '../models/file-format.model.js';

type FileFormatSelection = TableSelection<'FileFormat'>;
type FileFormatInsertion = TableInsertion<'FileFormat'>;

export interface FileFormatRepository {
	/** cached */
	findAllByExtension(
		extension: FileExtension,
	): Promise<NonEmptyArray<FileFormatSelection> | undefined>;
	/** cached */
	findByID(fileFormatID: number): Promise<FileFormatSelection | undefined>;

	save(fileFormat: FileFormatInsertion): Promise<number>;
	save(fileFormats: FileFormatInsertion[]): Promise<number[]>;

	saveOrUpdate(fileFormat: FileFormatInsertion): Promise<number>;
	saveOrUpdate(fileFormats: FileFormatInsertion[]): Promise<number[]>;
}

type ExtensionToFormatsMap = Map<FileExtension, FileFormatSelection[]>;
type IdToFormatMap = Map<number, FileFormatSelection>;

class FileFormatRepositoryCache {
	private _requiresUpdate: boolean = true;
	private _updatePromise: Promise<void> | null = null;
	private _extensionToFormatsMap: Readonly<ExtensionToFormatsMap> = Object.freeze(new Map());
	private _idToFormatMap: Readonly<IdToFormatMap> = Object.freeze(new Map());

	requiresUpdate(): void {
		this._requiresUpdate = true;
	}

	private async _updateIfRequired() {
		if (this._updatePromise) {
			await this._updatePromise;
		} else if (this._requiresUpdate) {
			await this.update();
		}
	}

	async getExtensionToFormatsMap(): Promise<Readonly<ExtensionToFormatsMap>> {
		await this._updateIfRequired();
		return this._extensionToFormatsMap;
	}
	async getIdToFormatMap(): Promise<Readonly<IdToFormatMap>> {
		await this._updateIfRequired();
		return this._idToFormatMap;
	}

	update(): Promise<void> {
		this._updatePromise = xaro.db
			.selectFrom('FileFormat')
			.selectAll()
			.execute()
			.then((formats) => {
				const idToFormatMap: IdToFormatMap = new Map();
				const extensionToFormatsMap: ExtensionToFormatsMap = new Map();

				formats.map((fileFormat) => {
					idToFormatMap.set(fileFormat.id, fileFormat);
					fileFormat.extensions.forEach((extension) => {
						const list = extensionToFormatsMap.get(extension) ?? [];
						list.push(fileFormat);
						extensionToFormatsMap.set(extension, list);
					});
				});

				this._extensionToFormatsMap = Object.freeze(extensionToFormatsMap);
				this._idToFormatMap = Object.freeze(idToFormatMap);

				this._updatePromise = null;
				this._requiresUpdate = false;
			});

		return this._updatePromise;
	}
}

const cache = new FileFormatRepositoryCache();

export const fileFormatRepository: FileFormatRepository = {
	async findAllByExtension(extension) {
		return cache
			.getExtensionToFormatsMap()
			.then((map) => map.get(extension) as NonEmptyArray<FileFormatSelection> | undefined);
	},
	async findByID(fileFormatID) {
		return cache.getIdToFormatMap().then((map) => map.get(fileFormatID));
	},
	async save(values) {
		const result = await insert('FileFormat', values);

		cache.requiresUpdate();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return result as any;
	},
	async saveOrUpdate(fileFormat) {
		const many = Array.isArray(fileFormat);

		const query = xaro.db
			.insertInto('FileFormat')
			.values(fileFormat)
			.onConflict((cb) =>
				cb.column('id').doUpdateSet((eb) => ({
					category: eb.ref('excluded.category'),
					description: eb.ref('excluded.description'),
					extensions: eb.ref('excluded.extensions'),
					displayName: eb.ref('excluded.displayName'),
					shortName: eb.ref('excluded.shortName'),
				})),
			)
			.returning('id as id');

		const result = await (many
			? query.execute().then((result) => result.map(({ id }) => id))
			: query.executeTakeFirstOrThrow().then((result) => result.id));

		cache.requiresUpdate();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return result as any;
	},
};