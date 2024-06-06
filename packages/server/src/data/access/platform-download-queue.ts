// import { db } from '../../index.js';

// export async function addToPlatformDownloadQueue({
// 	items,
// 	plugin,
// 	userId,
// }: {
// 	plugin: string;
// 	userId: number;
// 	items: unknown[];
// }) {
// 	await db
// 		.selectFrom('Plugin')
// 		.select('id')
// 		.where((eb) =>
// 			eb.and([eb('name', '=', plugin), eb('isEnabled', '=', 1)]),
// 		)
// 		.executeTakeFirstOrThrow()
// 		.then(({ id }) =>
// 			db
// 				.insertInto('PlatformDownloadQueue')
// 				.values(
// 					items.map((data) => ({
// 						data: JSON.stringify(data),
// 						linkedPluginId: id,
// 						linkedUserId: userId,
// 					})),
// 				)
// 				.onConflict((cb) => cb.doNothing())
// 				.execute(),
// 		);
// }
