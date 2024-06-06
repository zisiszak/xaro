import { db } from '~/index.js';
import { $callInsert, $callSelect } from '~/libs/kysely/index.js';
import { errorOutcome } from '~/utils/outcomes.js';
import { toAlphanumericKebabCase } from '~/utils/strings/exps/index.js';
import { type PlatformProfile } from '../model/tables/index.js';
import { addCreatorIfNotExists } from './person.js';

export async function linkUserToPlatformProfile({
	userId,
	platformProfileId,
}: {
	userId: number;
	platformProfileId: number;
}) {
	return db
		.insertInto('UserLinkedPlatformProfile')
		.values({
			linkedPlatformProfileId: platformProfileId,
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

export interface AddPlatformProfileIfNotExistsProps {
	sourceId: string;
	sourceUrl?: string;
	displayName: string;
	name: string;
	subscribers?: number;
	description?: string;
	dateCreated?: string;
	linkedPlatformId: number;
	linkedPersonId?: number;
	assets?: Record<string, string>;
}
export async function addPlatformProfileIfNotExists(
	{ assets = {}, ...props }: AddPlatformProfileIfNotExistsProps,
	extractMetadataWhenProfileDoesNotExist?: () => Promise<Omit<
		AddPlatformProfileIfNotExistsProps,
		'linkedPlatformId'
	> | null>,
) {
	let insertValue = {
		...props,
		assets: JSON.stringify(assets),
	} as PlatformProfile.Insertion;

	let existsQuery = db
		.selectFrom('PlatformProfile')
		.select('id')
		.where('sourceId', '=', insertValue.sourceId)
		.where('linkedPlatformId', '=', insertValue.linkedPlatformId);
	if (typeof insertValue.linkedPersonId !== 'undefined') {
		existsQuery = existsQuery.where(
			'linkedPersonId',
			'=',
			insertValue.linkedPersonId,
		);
	}

	return existsQuery.$call($callSelect.first).then(async (result) => {
		if (result) {
			return result.id;
		}

		if (extractMetadataWhenProfileDoesNotExist) {
			const extracted =
				await extractMetadataWhenProfileDoesNotExist().catch(
					() => null,
				);
			if (extracted === null) {
				return Promise.reject(
					errorOutcome({
						message: 'Failed to extract platform profile metadata.',
						context: props,
					}),
				);
			}
			insertValue = {
				...insertValue,
				...extracted,
				assets: JSON.stringify(extracted.assets) ?? insertValue.assets,
			};
		}

		if (typeof insertValue.linkedPersonId === 'undefined') {
			const personName = toAlphanumericKebabCase(props.name);
			insertValue.linkedPersonId = await addCreatorIfNotExists({
				name: personName,
				displayName: props.displayName,
				firstAssociatedPlatformId: props.linkedPlatformId,
			});
		}

		return db
			.insertInto('PlatformProfile')
			.values(insertValue)
			.$call($callInsert.onConflictThrow) as Promise<number>;
	});
}
