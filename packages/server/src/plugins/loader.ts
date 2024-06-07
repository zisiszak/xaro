import { mkdirDefaults } from '@utils/fs/index.js';
import { newError } from 'exitus';
import path from 'path';
import { type Database } from '~/data/model/database.js';
import { config, logger } from '~/index.js';
import { deepFreeze } from '~/utils/types-and-guards/index.js';
import {
	pluginModuleHandlers,
	type Plugin,
	type PluginManifest,
	type PluginModuleKind,
	type PluginModuleReference,
	type PluginStartCallbackParams,
} from './index.js';
import {
	pluginModuleKinds,
	type AnyPluginModule,
	type LinkModuleReferencesCallback,
	type MappedPluginModule,
	type MappedPluginModuleConfig,
	type PluginModule,
	type PluginModuleConfig,
	type PluginModuleLoaderCallback,
	type PluginModuleManifest,
} from './modules/shared/index.js';
import { createPluginLogger } from './utils/logger.js';

const pluginNameToId: Map<string, unknown> = new Map();
/**
 * Key: `${plugin.name}.${module.name}`
 */
const pluginModuleReferenceToPluginModule: Map<PluginModuleReference, AnyPluginModule> = new Map();

const pluginModuleKindToPluginModuleReferences: Map<PluginModuleKind, PluginModuleReference[]> =
	new Map();

export type LoadedModuleType = {
	[K in PluginModuleKind]: {
		name: string;
		module: MappedPluginModule<K>;
		linkReferences: LinkModuleReferencesCallback<K> | null;
	};
}[PluginModuleKind];

export async function loadPlugin(
	{ manifest: pluginManifest, customConfig, onStart }: Plugin,
	{
		database,
	}: {
		database: Database;
	},
) {
	let previousVersion: string | null = null;

	if (pluginManifest.name.includes('.')) {
		const outcome = newError({
			message: 'Plugin name cannot contain a "."',
			context: {
				name: pluginManifest.name,
			},
		});
		logger.error(outcome);

		return Promise.reject(outcome);
	}

	// Check to see if the plugin is in the database, and get the plugin ID (if the plugin isn't disabled).
	const pluginId = await database
		.selectFrom('Plugin')
		.select(['isEnabled', 'id', 'version'])
		.where((eb) => eb.and([eb('name', '=', pluginManifest.name)]))
		.executeTakeFirstOrThrow()
		.then(({ id, isEnabled, version }) => {
			if (version !== pluginManifest.version) {
				previousVersion = version;
			}
			if (isEnabled === 1) {
				return id;
			}
			return null;
		})
		.catch(() =>
			database
				.insertInto('Plugin')
				.values({
					version: pluginManifest.version,
					description: pluginManifest.description,
					name: pluginManifest.name,
					displayName: pluginManifest.displayName,
					isEnabled: 1,
				})
				.executeTakeFirstOrThrow()
				.then((result) => Number(result.insertId)),
		);
	if (pluginId === null) {
		const outcome = newError({
			context: {
				plugin: pluginManifest.name,
				displayName: pluginManifest.displayName,
			},
			log: 'warn',
			message: 'Plugin disabled. Skipping...',
		});
		return Promise.reject(outcome);
	}

	const moduleManifests = pluginManifest.modules;

	const moduleNames = new Set();
	let invalidModuleManifestReason: string | null = null;
	const invalidModuleManifest = moduleManifests.find((moduleManifest) => {
		if (moduleNames.has(moduleManifest.name)) {
			invalidModuleManifestReason =
				'Duplicate module name identifier found in module manifests.';
			return true;
		}
		if (!pluginModuleKinds.includes(moduleManifest.kind)) {
			invalidModuleManifestReason =
				'Invalid module kind specifier provided in module manifest.';
			return true;
		}
		if (moduleManifest.name.includes('.')) {
			invalidModuleManifestReason = 'Plugin module name cannot contain a "."';
			return true;
		}
		return false;
	});
	if (invalidModuleManifest) {
		const outcome = newError({
			message: invalidModuleManifestReason!,
			context: {
				moduleManifest: invalidModuleManifest,
				plugin: pluginManifest.name,
			},
			log: 'error',
		});
		return Promise.reject(outcome);
	}

	// Create the plugin directory
	const pluginDir = path.join(config.libraryDir, 'plugins', pluginManifest.name);
	await mkdirDefaults(pluginDir);

	// Create the logger functions
	const pluginLogger = createPluginLogger(pluginManifest.name);

	// Load plugin modules
	const loadedModules: LoadedModuleType[] = [];
	const optionalModulesThatFailedToLoad: string[] = [];
	let requiredModuleFailedToLoad = false;
	let pluginModulesPromise: Promise<null | void> = Promise.resolve();
	const pluginModuleLoader: PluginModuleLoaderCallback = <Kind extends PluginModuleKind>(
		module: MappedPluginModuleConfig<Kind>,
	) => {
		logger.info({
			message: 'Loading plugin module',
			context: {
				module: module.name,
				plugin: pluginManifest.name,
				kind: module.kind,
			},
		});
		pluginModulesPromise = pluginModulesPromise.then(async () => {
			if (requiredModuleFailedToLoad) {
				const outcome = newError({
					message:
						'Required module failed to load, but next module load was still attempted.',
					context: {
						module: module.name,
						moduleKind: module.kind,
						plugin: pluginManifest.name,
					},
				});
				logger.error(outcome);
				return Promise.reject(outcome);
			}

			const matchingManifest = moduleManifests.find(
				(moduleManifest) =>
					moduleManifest.kind === module.kind && moduleManifest.name === module.name,
			) as undefined | PluginModuleManifest<typeof module.kind>;

			if (!matchingManifest) {
				requiredModuleFailedToLoad = true;
				const outcome = newError({
					message: 'No matching module manifest found for attempted module load',
					context: {
						module: module.name,
						moduleKind: module.kind,
						plugin: pluginManifest.name,
					},
				});

				logger.error(outcome);
				return Promise.reject(outcome);
			}
			const { description = null, optional = false, displayName } = matchingManifest;

			const handler = pluginModuleHandlers[module.kind];
			if (handler === null) {
				const outcome = newError({
					message: 'Plugin module kind not yet implemented.',
					context: {
						moduleKind: module.kind,
						module: module.name,
						plugin: pluginManifest.name,
					},
				});
				logger.error(outcome);
				throw outcome;
			}

			return handler(
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				module as any,
				{
					pluginId: pluginId,
					pluginName: pluginManifest.name,
				},
			).then(({ linkModuleReferences, loadedProps }) => {
				loadedModules.push({
					name: module.name,
					module: {
						...loadedProps,
						kind: module.kind,
						name: module.name,
						displayName,
						optional,
						description,
						pluginId,
						pluginName: pluginManifest.name,
					},
					linkReferences: linkModuleReferences,
				} as LoadedModuleType);
			});
		});
	};

	const pluginStartParams: PluginStartCallbackParams = {
		customConfig:
			typeof customConfig === 'object' && customConfig !== null
				? deepFreeze(customConfig)
				: null,
		loadModule: pluginModuleLoader,
		previousVersion: previousVersion,
		currentVersion: pluginManifest.version,
		pluginDir,
		pluginLogger,
	};

	try {
		onStart(pluginStartParams);
		await pluginModulesPromise;
	} catch (err) {
		const outcome = newError({
			message: 'Plugin failed to start after being initialised.',
			caughtException: err,
			context: {
				plugin: pluginManifest.name,
			},
		});
		logger.error(outcome);
		return Promise.reject(outcome);
	}

	loadedModules.map(({ name, module: loadedModule }) => {
		const moduleReference = `${pluginManifest.name}.${name}` as const;
		pluginModuleReferenceToPluginModule.set(moduleReference, loadedModule as AnyPluginModule);
		const kindArray = pluginModuleKindToPluginModuleReferences.get(loadedModule.kind);
		if (!kindArray) {
			pluginModuleKindToPluginModuleReferences.set(loadedModule.kind, [moduleReference]);
		} else {
			kindArray.push(moduleReference);
		}
	});

	if (optionalModulesThatFailedToLoad.length !== 0) {
		logger.warn({
			message: 'Optional plugin modules failed to load.',
			context: {
				modules: optionalModulesThatFailedToLoad,
				plugin: pluginManifest.name,
			},
		});
	}
	logger.info({
		context: {
			plugin: pluginManifest.name,
			version: pluginManifest.version,
			loadedModules: loadedModules.map(({ name }) => name),
		},
		message: 'Plugin loaded successfully.',
	});

	pluginNameToId.set(pluginManifest.name, pluginId);

	return {
		loadedModules: loadedModules,
	};
}

export type MappedPluginModules<Manifest extends PluginManifest> = {
	[Name in Manifest['modules'][number] as Name['name']]: Manifest['modules'][number] extends infer E extends
		PluginModuleConfig<PluginModuleKind>
		? MappedPluginModule<E['kind']>
		: undefined;
};
export function usePlugin<Manifest extends PluginManifest>(
	nameOrId: string | number,
): MappedPluginModules<Manifest> | null {
	let pluginName: string | null = null;

	if (typeof nameOrId === 'string') {
		pluginName = nameOrId;
	} else {
		pluginNameToId.forEach((id, key) => {
			if (id === nameOrId) {
				pluginName = key;
			}
		});
	}

	if (pluginName === null) {
		return null;
	}

	return Object.fromEntries(
		Array.from(pluginModuleReferenceToPluginModule)
			.filter(([name]) => name.startsWith(`${pluginName}.`))
			.map(([key, module]) => [key.slice(pluginName!.length + 1), module]),
	) as MappedPluginModules<Manifest>;
}

export function usePluginModule<
	Module extends PluginModule<any> = MappedPluginModule<PluginModuleKind>,
>(pluginModuleReference: PluginModuleReference): Module | null {
	return (
		(pluginModuleReferenceToPluginModule.get(pluginModuleReference) as Module | undefined) ??
		null
	);
}

export function getPluginModulesByKind<
	Kind extends PluginModuleKind,
	Module extends PluginModule<Kind> = MappedPluginModule<Kind>,
>(kind: Kind): Module[] {
	const array = pluginModuleKindToPluginModuleReferences.get(kind);
	if (!array) {
		return [];
	}
	return array
		.map((reference, index) => {
			const module = usePluginModule<Module>(reference);
			if (module === null) {
				array.splice(index);
				return null;
			}
			return module;
		})
		.filter(<T>(v: T | null): v is T => v !== null);
}
