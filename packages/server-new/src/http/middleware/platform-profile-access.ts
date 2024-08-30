import { type RequestHandler } from 'express';
// import {
// 	checkIDExistsInTable,
// 	checkIfUserLinkedToPlatformProfile,
// 	findPlatformProfileIDByName,
// } from '~/models/database/access.js';
// import { PlatformProfiles } from '~/models/database/tables/index.js';

interface IDOrNameParams {
	platform_profile_id_or_name: string;
}
interface IDParams {
	platform_profile_id: number;
}

export type Params = IDOrNameParams | IDParams;

export const PlatformProfileAccessMiddleware: RequestHandler<Params> = async () => {
	// let platformProfileID: number | undefined = undefined;
	// const sanitisedPlatformProfileID = cleanInt(
	// 	(req.params as IDParams).platform_profile_id ??
	// 		(req.params as IDOrNameParams).platform_profile_id_or_name,
	// );
	// if (typeof sanitisedPlatformProfileID === 'number') {
	// 	if (await checkIDExistsInTable(PlatformProfiles.name, sanitisedPlatformProfileID)) {
	// 		platformProfileID = sanitisedPlatformProfileID;
	// 	}
	// } else {
	// 	const sanitisedPlatformProfileName = cleanString(
	// 		(req.params as IDOrNameParams).platform_profile_id_or_name,
	// 	);
	// 	if (typeof sanitisedPlatformProfileName === 'string') {
	// 		platformProfileID = await findPlatformProfileIDByName(
	// 			req.platformID!,
	// 			sanitisedPlatformProfileName,
	// 		);
	// 	} else return void res.status(400).end();
	// }
	// if (typeof platformProfileID === 'undefined') return void res.status(404).end();
	// await checkIfUserLinkedToPlatformProfile(platformProfileID, req.userAccessToken!.id).then(
	// 	(hasAccess) => {
	// 		if (!hasAccess) return void res.status(401).end();
	// 		req.platformProfileID = platformProfileID;
	// 		next();
	// 	},
	// );
};
