import { join } from 'path';
import { logger } from '~/index.js';
import { mkdirRecursive } from '~/utils/fs.js';
import { type LoadedPlugin, type Plugin } from './model.js';
import { pluginModuleLoaders } from './plugin-modules/index.js';
import {
	type AnyLoadedPluginModule,
	pluginModuleKindSet,
	type PluginModuleLoaderFunction,
} from './plugin-modules/shared.js';

const loadedPluginMap: Map<string, LoadedPlugin> = new Map();

export async function loadPlugin({
	name: pluginName,
	description,
	modules,
	displayName,
}: Plugin): Promise<string> {
	logger.info(`Loading Plugin: ${pluginName}`);

	if (pluginName.includes('.'))
		throw {
			msg: 'Invalid Plugin name provided.',
			pluginName,
		};
	if (loadedPluginMap.has(pluginName))
		throw {
			msg: 'Plugin with the same name has already been loaded.',
			pluginName,
		};

	const pluginDataDir = join(process.env.ROOT_DIRECTORY, 'data', 'plugins', pluginName);
	await mkdirRecursive(pluginDataDir);

	const modulesLoaded: AnyLoadedPluginModule[] = [];
	const optionalModulesThatFailedToLoad: string[] = [];

	let modulesLoadPromise: Promise<void> = Promise.resolve();
	Object.entries(modules).forEach(([moduleName, module]) => {
		// eslint-disable-next-line @typescript-eslint/ban-types
		const handleError = (reason: string, context: {} = {}) => {
			if (module.optional === true) {
				optionalModulesThatFailedToLoad.push(moduleName);
				logger.error(
					{ pluginName, moduleName, reason, ...context },
					`Failed to load optional Plugin Module.`,
				);
			} else {
				logger.error(
					{ pluginName, moduleName, reason, ...context },
					'Failed to load required Plugin Module.',
				);
				throw null;
			}
		};

		if (moduleName.includes('.')) return handleError('Invalid Plugin Module name provided.');

		if (!pluginModuleKindSet.has(module.kind))
			return handleError('Invalid Plugin Module kind specified.', {
				moduleKind: module.kind,
			});

		const loader = pluginModuleLoaders[module.kind];
		if (!loader)
			return handleError('Plugin Module loader not yet implemented.', {
				moduleKind: module.kind,
			});

		modulesLoadPromise = modulesLoadPromise.then(async () => {
			try {
				const loadedModule = await (loader as PluginModuleLoaderFunction<typeof module>)(
					module,
					{
						description: module.description ?? null,
						displayName: module.displayName,
						id: `${pluginName}.${moduleName}`,
						kind: module.kind,
						name: moduleName,
						optional: module.optional === true,
					},
				);
				modulesLoaded.push(loadedModule);
			} catch (err) {
				return handleError('Plugin Module module-specific load failed.', { error: err });
			}
		});
	});

	await modulesLoadPromise;

	if (modulesLoaded.length === 0) {
		logger.warn({ pluginName }, 'No PluginModules loaded for Plugin.');
	}
	if (optionalModulesThatFailedToLoad.length !== 0) {
		logger.warn(
			{ pluginName, optionalModulesThatFailedToLoad },
			'At least one optional PluginModule did not load.',
		);
	}

	logger.info({ pluginName, modules: modulesLoaded.map(({ name }) => name) }, 'Plugin loaded.');

	const loadedModulesMap: Map<string, AnyLoadedPluginModule> = new Map();
	modulesLoaded.forEach((module) => loadedModulesMap.set(module.name, module));

	const loadedPlugin: LoadedPlugin = {
		name: pluginName,
		displayName,
		description: description ?? null,
		loadedModules: loadedModulesMap,
	};

	loadedPluginMap.set(pluginName, loadedPlugin);

	return pluginName;
}

export function getPlugin(name: string): LoadedPlugin | null {
	const plugin = loadedPluginMap.get(name);
	if (!plugin) {
		logger.error(`Plugin with name '${name}' is not loaded or does not exist.`);
		return null;
	}
	return plugin;
}

export function getPluginModule<M extends AnyLoadedPluginModule>(
	plugin: string,
	module: string,
): M | null;
export function getPluginModule<M extends AnyLoadedPluginModule>(
	pluginModuleReference: string,
): M | null;
export function getPluginModule(
	plugin_pluginModuleReference: string,
	module_undefined?: string | undefined,
) {
	let pluginName: string;
	let moduleName: string;
	if (typeof module_undefined === 'undefined') {
		const split = plugin_pluginModuleReference.split('.');
		if (split.length !== 2) throw 'Invalid plugin module reference.';
		[pluginName, moduleName] = split as [string, string];
	} else {
		pluginName = plugin_pluginModuleReference;
		moduleName = module_undefined;
	}

	const plugin = getPlugin(pluginName);
	if (!plugin) return null;

	const module = plugin.loadedModules.get(moduleName);
	if (!module) {
		logger.error(`PluginModule '${pluginName}.${moduleName}' is not loaded or does not exist.`);
		return null;
	}

	return module;
}
