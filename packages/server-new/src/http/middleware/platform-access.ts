import { type RequestHandler } from 'express';
// import {
// 	checkIDExistsInTable,
// 	checkIfUserLinkedToPlatform,
// 	findPlatformIDByName,
// } from '~/models/database/access.js';
// import { Platforms } from '~/models/database/tables/index.js';

export interface Params {
	platform_id_or_name: string | number;
}

export const PlatformAccessMiddleware: RequestHandler<Params> = async () => {
	// let platformID: number | undefined = undefined;
	// const sanitisedPlatformID = cleanInt(req.params.platform_id_or_name);
	// if (typeof sanitisedPlatformID === 'number') {
	// 	if (await checkIDExistsInTable(Platforms.name, sanitisedPlatformID)) {
	// 		platformID = sanitisedPlatformID;
	// 	}
	// } else {
	// 	const sanitisedPlatformName = cleanString(req.params.platform_id_or_name);
	// 	if (typeof sanitisedPlatformName === 'string') {
	// 		platformID = await findPlatformIDByName(sanitisedPlatformName);
	// 	} else return void res.status(400).end();
	// }
	// if (typeof platformID === 'undefined') return void res.status(404).end();
	// await checkIfUserLinkedToPlatform(platformID, req.userAccessToken!.id).then((linked) => {
	// 	if (!linked) return void res.status(401).end();
	// 	req.platformID = platformID;
	// 	next();
	// });
};
