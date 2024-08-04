import * as ContentFiles from './content-files.js';
import * as Content from './content.js';
import * as FileFormats from './file-formats.js';
import * as Files from './files.js';
import * as Platforms from './platforms.js';
import * as PluginModules from './plugin-modules.js';
import * as Plugins from './plugins.js';
import * as UserContentStats from './user-content-stats.js';
import * as Users from './users.js';

export {
	Content,
	ContentFiles,
	FileFormats,
	Files,
	Platforms,
	PluginModules,
	Plugins,
	UserContentStats,
	Users,
};

export interface Schema {
	[ContentFiles.name]: ContentFiles.__TableSchema;
	[Content.name]: Content.__TableSchema;
	[FileFormats.name]: FileFormats.__TableSchema;
	[Files.name]: Files.__TableSchema;
	[Platforms.name]: Platforms.__TableSchema;
	[PluginModules.name]: PluginModules.__TableSchema;
	[Plugins.name]: Plugins.__TableSchema;
	[UserContentStats.name]: UserContentStats.__TableSchema;
	[Users.name]: Users.__TableSchema;
}

export const tableOrder = [
	Users,
	Plugins,
	PluginModules,
	Platforms,
	FileFormats,
	Files,
	Content,
	ContentFiles,
	UserContentStats,
];
