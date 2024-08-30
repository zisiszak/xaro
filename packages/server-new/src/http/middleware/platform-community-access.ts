import { type RequestHandler } from 'express';
// import {
// 	checkIDExistsInTable,
// 	checkIfUserLinkedToPlatformCommunity,
// 	findPlatformCommunityIDByName,
// } from '~/models/database/access.js';
// import { PlatformCommunities } from '~/models/database/tables/index.js';

interface IDOrNameParams {
	platform_community_id_or_name: string;
}
interface IDParams {
	platform_community_id: number;
}

export type Params = IDOrNameParams | IDParams;

export const PlatformCommunityAccessMiddleware: RequestHandler<Params> = async () => {
	// let platformCommunityID: number | undefined = undefined;
	// const sanitisedPlatformCommunityID = cleanInt(
	// 	(req.params as IDParams).platform_community_id ??
	// 		(req.params as IDOrNameParams).platform_community_id_or_name,
	// );
	// if (typeof sanitisedPlatformCommunityID === 'number') {
	// 	if (await checkIDExistsInTable(PlatformCommunities.name, sanitisedPlatformCommunityID)) {
	// 		platformCommunityID = sanitisedPlatformCommunityID;
	// 	}
	// } else {
	// 	const sanitisedPlatformCommunityName = cleanString(
	// 		(req.params as IDOrNameParams).platform_community_id_or_name,
	// 	);
	// 	if (typeof sanitisedPlatformCommunityName === 'string') {
	// 		platformCommunityID = await findPlatformCommunityIDByName(
	// 			req.platformID!,
	// 			sanitisedPlatformCommunityName,
	// 		);
	// 	} else return void res.status(400).end();
	// }
	// if (typeof platformCommunityID === 'undefined') return void res.status(404).end();
	// await checkIfUserLinkedToPlatformCommunity(platformCommunityID, req.userAccessToken!.id).then(
	// 	(hasAccess) => {
	// 		if (!hasAccess) return void res.status(401).end();
	// 		req.platformCommunityID = platformCommunityID;
	// 		next();
	// 	},
	// );
};
