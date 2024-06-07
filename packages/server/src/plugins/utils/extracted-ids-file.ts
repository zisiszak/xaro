import { newError } from 'exitus';
import { access, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { config, db } from '../../index.js';
import { mkdirDefaults } from '../../utils/fs/index.js';

export interface ExtractedIdsFile {
	read(): Promise<string[]>;
	sync(): Promise<string[]>;

	readonly filePath: string;
}

const readIdsFile = async (filePath: string) =>
	readFile(filePath, 'utf-8').then((data) => data.split('\n').map((value) => value.trim()));

export async function createExtractedIdsFile(platform: string): Promise<ExtractedIdsFile> {
	const filePath = path.join(config.platformsDir, platform, 'reference', `extracted_ids.txt`);

	await mkdirDefaults(path.dirname(filePath));

	return access(filePath)
		.catch(() => writeFile(filePath, ''))
		.catch((err) =>
			Promise.reject(
				newError({
					caughtException: err,
					log: 'error',
					message: 'Failed to create ids file. Does the platform directory exist?',
				}),
			),
		)
		.then(() => {
			const idsFileAccess: ExtractedIdsFile = {
				async read() {
					return readIdsFile(this.filePath);
				},

				async sync() {
					return db
						.selectFrom('PlatformLinkedContent')
						.select('sourceId')
						.where((eb) =>
							eb.and([
								eb('linkedPlatformId', '=', (eb) =>
									eb
										.selectFrom('Platform')
										.select('id')
										.where('name', '=', platform),
								),
								eb('sourceId', 'is not', null),
							]),
						)
						.execute()
						.then(async (data) => {
							const ids = data.map(({ sourceId }) => sourceId!);
							const existing = await this.read();

							const str = Array.from(new Set(ids)).join('\n');

							if (str !== Array.from(new Set(existing)).join('\n')) {
								await writeFile(this.filePath, str);
							}

							return ids;
						});
				},

				filePath: filePath,
			};

			return idsFileAccess;
		});
}

export async function createGenericExtractedIdsFile(
	pluginModuleReference: PluginModuleReference,
): Promise<ExtractedIdsFile> {
	const [plugin, module] = pluginModuleReference.split('.') as [string, string];

	const filePath = path.join(config.libraryDir, 'plugins', plugin, `${module}_archive.txt`);

	await mkdirDefaults(path.dirname(filePath));

	return access(filePath)
		.catch(() => writeFile(filePath, ''))
		.catch((err) =>
			Promise.reject(
				newError({
					caughtException: err,
					log: 'error',
					message: 'Failed to create ids file. Does the plugin directory exist?',
				}),
			),
		)
		.then(() => {
			const extractedIdsFile: ExtractedIdsFile = {
				filePath: filePath,
				async read() {
					return readIdsFile(this.filePath);
				},
				async sync() {
					return db
						.selectFrom('PlatformLinkedContent')
						.select('sourceUrl')
						.where((eb) =>
							eb.and([
								eb('linkedPlatformId', 'in', (eb) =>
									eb
										.selectFrom('Platform')
										.select('id')
										.where(
											'Platform.genericPlatformsManager',
											'=',
											pluginModuleReference,
										),
								),
								eb('sourceUrl', 'is not', null),
							]),
						)
						.execute()
						.then(async (data) => {
							const urls = data.map(({ sourceUrl }) => sourceUrl!);
							const existing = await this.read();

							const str = Array.from(new Set(urls)).join('\n');

							if (str !== Array.from(new Set(existing)).join('\n')) {
								await writeFile(this.filePath, str);
							}

							return urls;
						});
				},
			};

			return extractedIdsFile;
		});
}
