import { newError } from 'exitus';
import path from 'path';
import { config, db, logger } from '~/index.js';
import { $callInsert } from '~/libs/kysely/index.js';
import { mkdirDefaults } from '~/utils/fs/index.js';
import { type Platform } from '../model/tables/index.js';

export async function linkUserToPlatform({
	userId,
	platformId,
}: {
	userId: number;
	platformId: number;
}) {
	return db
		.insertInto('UserLinkedPlatform')
		.values({
			linkedPlatformId: platformId,
			linkedUserId: userId,
		})
		.$call($callInsert.onConflictDoNothing)
		.then((result) => {
			if (typeof result === 'undefined') {
				logger.info({
					message: 'User successfully linked to platform.',
					context: {
						userId,
						platformId,
					},
				});
				return undefined;
			}
			return null;
		})
		.catch((err) =>
			newError({
				caughtException: err,
				log: 'error',
				message: 'Failed to link user to platform.',
			}),
		);
}

export async function getPlatformNameFromId(id: number): Promise<string> {
	return db
		.selectFrom('Platform')
		.select('name')
		.where('id', '=', id)
		.executeTakeFirstOrThrow()
		.then(({ name }) => name);
}

export async function getPlatformDirs(nameOrId: number | string) {
	let name: string;
	if (typeof nameOrId === 'string') {
		name = nameOrId;
	} else {
		name = await getPlatformNameFromId(nameOrId);
	}

	const rootDir = path.join(config.platformsDir, name);
	const referenceDir = path.join(rootDir, 'reference');
	const assetsRootDir = path.join(rootDir, 'assets');

	const communityAssetsDir = path.join(assetsRootDir, 'community');
	const platformAssetsDir = path.join(assetsRootDir, 'platform');
	const profileAssetsDir = path.join(assetsRootDir, 'profile');

	await mkdirDefaults(profileAssetsDir, platformAssetsDir, communityAssetsDir, referenceDir);

	return {
		root: rootDir,
		reference: referenceDir,
		assets: {
			root: assetsRootDir,
			community: communityAssetsDir,
			profile: profileAssetsDir,
			platform: platformAssetsDir,
		},
	};
}

export async function getPlatformDetails(
	platformIdOrName: string | number,
): Promise<Platform.Selection> {
	return db
		.selectFrom('Platform')
		.selectAll()
		.where(typeof platformIdOrName === 'string' ? 'name' : 'id', '=', platformIdOrName)
		.executeTakeFirstOrThrow();
}
