/* eslint-disable @typescript-eslint/consistent-type-imports */
type PluginModuleReference = `${string}.${string}`;

declare namespace Express {
	export interface Request {
		basicAuth?: import('./utils/index.ts').ParsedBasicAuthHeader;
		userAccessToken?: import('./modules/users/index.ts').UserAccessTokenPayload;
		content?: import('./models/database/tables/index.ts').Content.Selection;
		mediaID?: number;
		platform?: import('./models/database/tables/index.ts').Platforms.Selection;
		platformID?: number;
		platformCommunity?: import('./models/database/tables/index.ts').PlatformCommunities.Selection;
		platformCommunityID?: number;
		platformProfile?: import('./models/database/tables/index.ts').PlatformProfiles.Selection;
		platformProfileID?: number;
		fileID?: number;
		fileLibraryPath?: string;
	}
}
