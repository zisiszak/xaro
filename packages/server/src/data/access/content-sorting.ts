import { errorOutcome, toAlphanumericKebabCase } from '~/exports.js';
import { db, logger } from '~/index.js';

type SortingType = 'SortingTag' | 'SortingGenre' | 'SortingCategory';

const sortingDisplayNameToName = toAlphanumericKebabCase;

const addSortingType =
	<K extends SortingType>(kind: K) =>
	async ({
		displayName,
		userId,
	}: {
		displayName: string;
		userId: number;
	}): Promise<{
		id: number;
		displayName: string;
		name: string;
		linkedUserId: number | null;
	}> => {
		const name = sortingDisplayNameToName(displayName);
		if (!displayName || !name) {
			return Promise.reject();
		}

		return db
			.selectFrom(
				kind as 'SortingTag' | 'SortingGenre' | 'SortingCategory',
			)
			.selectAll()
			.where((eb) =>
				eb.and([
					eb.or([
						eb('name', '=', name),
						eb('displayName', '=', displayName),
					]),
					eb.or([
						eb('linkedUserId', '=', userId),
						eb('linkedUserId', 'is', null),
					]),
				]),
			)
			.executeTakeFirst()
			.then(async (props) => {
				if (props) {
					return props;
				}
				return await db
					.insertInto(
						kind as
							| 'SortingTag'
							| 'SortingGenre'
							| 'SortingCategory',
					)
					.values({
						name,
						displayName,
						linkedUserId: userId,
					})
					.executeTakeFirstOrThrow()
					.then(({ insertId }) => ({
						name: name,
						displayName,
						linkedUserId: userId,
						id: Number(insertId),
					}));
			});
	};

export const addSortingTag = addSortingType('SortingTag');

export const clearContentSortingTags = async (contentId: number) =>
	db
		.deleteFrom('SortingTagLinkedContent')
		.where('linkedContentId', '=', contentId)
		.execute();

export const addContentSortingTags = async ({
	sortingTagIds,
	contentId,
}: {
	sortingTagIds: number[];
	contentId: number;
}) => {
	return db
		.insertInto('SortingTagLinkedContent')
		.values(
			Array.from(new Set([...sortingTagIds])).map((tag) => ({
				linkedContentId: contentId,
				linkedSortingTagId: tag,
			})),
		)
		.onConflict((cb) => cb.doNothing())
		.execute()
		.catch((err) => {
			logger.error(
				errorOutcome({
					message: 'Apply content sorting tag unhandled exception.',
					caughtException: err,
					context: {
						sortingTagIds,
						contentId,
					},
				}),
			);
		});
};
