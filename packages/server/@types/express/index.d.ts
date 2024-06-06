type PluginModuleReference = `${string}.${string}`;

interface ForwardedPlatformProps {
	id: number;
	name: string;
	genericPlatformsManager: PluginModuleReference | null;
	platformManager: PluginModuleReference | null;
	mediaExtractor: PluginModuleReference | null;
	metadataExtractor: PluginModuleReferenc | null;
}

interface ForwardedUserProps {
	id: number;
	username: string;
	role: 'admin' | 'user';
	expiry: number;
}

interface ForwardedStaticProps {
	filePath?: string;
}

interface ForwardedContentProps {
	id: number;
}

interface ForwardedPluginProps {}

declare namespace Express {
	export interface Request {
		// user?: {};
		// passthrough?: {
		// platformId?: number;
		// platformName?: string;
		// platformManager?: PluginModuleReference | null;
		// platformMediaExtractor?: PluginModuleReference | null;
		// platformMetadataExtractor?: PluginModuleReference | null;
		// contentId?: number;
		// staticFilePath?: string;
		// };
		forwarded: {
			platform: ForwardedPlatformProps | null;
			plugin: ForwardedPluginProps | null;
			content: ForwardedContentProps | null;
			user: ForwardedUserProps | null;
			static: ForwardedStaticProps | null;
		};
	}
}
