// import { xaro } from '~/index.js';
// import { type UserAccessTokenPayload } from '~/models/user-access-token.js';

// export async function getFileAccessMode(
// 	{
// 		fileID,
// 		relativeFilePath,
// 	}:
// 		| { fileID?: number; relativeFilePath: string }
// 		| { fileID: number; relativeFilePath?: string },
// 	userAccessToken: UserAccessTokenPayload,
// ): Promise<{
// 	mode: 'admin' | 'owner' | 'public';
// 	fileID: number;
// } | null> {
// 	if (userAccessToken.role === UserRoleEnum.admin && typeof fileID === 'number') {
// 		return {
// 			mode: 'admin',
// 			fileID,
// 		};
// 	}

// 	return xaro.db
// 		.selectFrom('Files')
// 		.select('id')
// 		.where((eb) =>
// 			eb.and([
// 				eb(
// 					typeof fileID === 'number' ? ('id' as const) : ('path' as const),
// 					'=',
// 					(typeof fileID === 'number' ? fileID : relativeFilePath)!,
// 				),
// 				eb('owner_id', '=', userAccessToken.id),
// 			]),
// 		)
// 		.executeTakeFirst()
// 		.then((result) => {
// 			if (!result) {
// 				return null;
// 			}

// 			return {
// 				mode: 'owner',
// 				fileID: result.id,
// 			};
// 		});
// }
