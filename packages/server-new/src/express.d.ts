/* eslint-disable @typescript-eslint/consistent-type-imports */
type PluginModuleReference = `${string}.${string}`;

interface ForwardedPlatformProps {
	id: number;
	name: string;
	genericPlatformsManager: PluginModuleReference | null;
	platformManager: PluginModuleReference | null;
	contentExtractor: PluginModuleReference | null;
	metadataExtractor: PluginModuleReference | null;
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
		basicAuth?: import('./utils/index.ts').ParsedBasicAuthHeader;
		userAccessToken?: import('./models/index.ts').UserAccessTokenPayload;

		forwarded: {
			platform: ForwardedPlatformProps | null;
			plugin: ForwardedPluginProps | null;
			content: ForwardedContentProps | null;
			user: ForwardedUserProps | null;
			static: ForwardedStaticProps | null;
		};
	}
}
