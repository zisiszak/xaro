import { errorOutcome } from '~/exports.js';
import { logger } from '~/index.js';
import {
	usePlugin,
	type PluginModuleKind,
	type PluginModuleReference,
} from '../../index.js';
import { type MappedPluginModule } from './index.js';

export type LinkModuleReferencesCallback<Kind extends PluginModuleKind> = (
	loadedModuleWithoutReferences: MappedPluginModule<Kind>,
) => void;

export function createLinkReferencesCallback<
	Kind extends PluginModuleKind,
	Key extends keyof MappedPluginModule<Kind>,
>(references: {
	[K in Key]: {
		kind: PluginModuleKind;
		reference: PluginModuleReference;
	} | null;
}): LinkModuleReferencesCallback<Kind> {
	const referenceMap = (
		Object.entries(references) as [
			Key,
			{
				kind: PluginModuleKind;
				reference: PluginModuleReference;
			} | null,
		][]
	).filter(
		<T>(entry: [Key, T | null]): entry is [Key, T] => entry[1] !== null,
	);

	return (loadedModuleWithoutReferences: MappedPluginModule<Kind>) => {
		referenceMap.forEach(
			([key, { reference: moduleReference, kind: moduleKind }]) => {
				const [referencedPluginName, referencedModuleName] =
					moduleReference.split('.') as [string, string];

				const referencedPlugin = usePlugin(referencedPluginName);

				const errorContext = {
					plugin: loadedModuleWithoutReferences.pluginName,
					module: loadedModuleWithoutReferences.name,
					referenceFor: key,
					pluginModuleLink: {
						moduleReference: moduleReference,
						moduleKind: moduleKind,
					},
				};

				if (referencedPlugin === null) {
					const error = errorOutcome({
						message:
							'Plugin module reference failed to link. Plugin not in loaded plugins.',
						context: errorContext,
					});
					if (loadedModuleWithoutReferences.optional) {
						logger.warn(error);
						loadedModuleWithoutReferences[key] = null;
						return;
					}

					logger.fatal(error);
					throw error;
				}

				const referencedModule = referencedPlugin[referencedModuleName];
				if (!referencedModule || referencedModule.kind !== moduleKind) {
					const error = errorOutcome({
						message: !referencedModule
							? 'Plugin module reference failed to link. The plugin was found, but the associated module could not be identified.'
							: 'Plugin module reference failed to link. The referenced plugin module was found, but it was not the right kind.',
						context: {
							...errorContext,
							referencedModuleKind: referencedModule
								? referencedModule.kind
								: null,
						},
					});

					if (loadedModuleWithoutReferences.optional) {
						logger.warn(error);
						loadedModuleWithoutReferences[key] = null;
						return;
					}

					logger.fatal(error);
					throw error;
				}

				loadedModuleWithoutReferences[key] = referencedModule;
			},
		);
	};
}
