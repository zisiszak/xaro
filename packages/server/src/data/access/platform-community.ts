import { errorOutcome } from '~/exports.js';
import { db } from '~/index.js';
import { $callInsert, $callSelect } from '~/libs/kysely/index.js';
import { type PlatformCommunity } from '../model/tables/index.js';

export async function linkUserToPlatformCommunity({
	userId,
	platformCommunityId,
}: {
	userId: number;
	platformCommunityId: number;
}) {
	return db
		.insertInto('UserLinkedPlatformCommunity')
		.values({
			linkedPlatformCommunityId: platformCommunityId,
			linkedUserId: userId,
		})
		.$call($callInsert.onConflictDoNothing)
		.catch((err) =>
			errorOutcome({
				caughtException: err,
				message: 'Failed to link user to platform profile.',
			}),
		);
}

export interface AddPlatformCommunityIfNotExistsProps {
	linkedPlatformId: number;
	displayName: string;
	name: string;
	sourceId: string;
	sourceUrl?: string;

	description?: string;
	subtitle?: string;
	subscribers?: number;
	dateCreated?: string;
}
export async function addPlatformCommunityIfNotExists(
	props: AddPlatformCommunityIfNotExistsProps,
	extractMetadataWhenCommunityDoesNotExist?: () => Promise<Omit<
		AddPlatformCommunityIfNotExistsProps,
		'linkedPlatformId'
	> | null>,
) {
	return db
		.selectFrom('PlatformCommunity')
		.select('id')
		.where((eb) =>
			eb.and([
				eb('sourceId', 'like', props.sourceId),
				eb('linkedPlatformId', '=', props.linkedPlatformId),
			]),
		)
		.$call($callSelect.first)
		.then(async (result) => {
			if (result) {
				return result.id;
			}

			let insertValue: PlatformCommunity.Insertion;
			if (extractMetadataWhenCommunityDoesNotExist) {
				const extracted =
					await extractMetadataWhenCommunityDoesNotExist().catch(
						() => null,
					);
				if (extracted === null) {
					return Promise.reject(
						errorOutcome({
							message:
								'Failed to extract PlatformCommunity metadata.',
							context: {
								...props,
							},
						}),
					);
				}
				insertValue = {
					...props,
					...extracted,
					assets: '{}',
				};
			} else {
				insertValue = { ...props, assets: '{}' };
			}

			return db
				.insertInto('PlatformCommunity')
				.values(insertValue)
				.$call($callInsert.onConflictThrow) as Promise<number>;
		});
}
