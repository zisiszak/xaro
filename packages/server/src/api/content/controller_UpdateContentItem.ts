import { exitus } from 'exitus';
import { type RequestHandler } from 'express';
import {
	addContentSortingTags,
	addSortingTag,
	clearContentSortingTags,
} from '~/data/access/content-sorting.js';
import { contentFileCategoriesMap } from '../../data/model/shared/content-file-categories.js';
import {
	custom_description_max_length,
	custom_title_max_length,
	ratings,
	type Rating,
} from '../../data/model/tables/UserLinkedContent.js';
import { type UserLinkedContent } from '../../data/model/tables/index.js';
import { db, logger } from '../../index.js';
import { $callCheck } from '../../libs/kysely/index.js';
import { toBoolishInt } from '../../utils/types-and-guards/index.js';

export type Body = {
	userMedia?: {
		customTitle?: string | null;
		customDescription?: string | null;
		preferredThumbnailId?: number | null;
		isFavourite?: boolean | null;
		rating?: number | null;
		isHidden?: boolean | null;
	};
	platformLinkedMedia?: null;
	sorting?: {
		tags?: string[];
	};
};
export type Success = {
	updates: {
		userMedia: Partial<UserLinkedContent.Selection> | null;
		sorting: {
			tags:
				| {
						displayName: string;
						id: number;
				  }[]
				| null;
		};
	};
};
export type Failure =
	| {
			invalidKeys: string[];
	  }
	| undefined;
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
export type Result = Success | Failure;

export const UpdateContentItemController: RequestHandler<
	never,
	Result,
	Body
> = async (req, res) => {
	const contentId = req.forwarded.content!.id!;
	const userId = req.forwarded.user!.id;

	const { userMedia = {}, sorting = {} } = req.body;
	const invalidKeys: string[] = [];
	const userContentUpdate: UserLinkedContent.Update = {};

	// TODO: This can all be made generic, and would be very easy to do.

	const result = {
		updates: {
			userMedia: null,
			sorting: {
				tags: null,
			},
		},
	} as Success;

	if (sorting.tags) {
		if (
			sorting.tags.some(
				(v) => typeof v !== 'string' && typeof v !== 'number',
			)
		) {
			return res.status(400).end();
		}
		await clearContentSortingTags(contentId);
		if (sorting.tags.length === 0) {
			result.updates.sorting.tags = [];
		} else {
			await Promise.all(
				sorting.tags.map(async (tag) =>
					addSortingTag({
						displayName: tag,
						userId: userId,
					}).then((data) => data.id),
				),
			).then((tagIds) =>
				addContentSortingTags({
					sortingTagIds: tagIds,
					contentId: contentId,
				}).then(() => {
					result.updates.sorting.tags = sorting.tags!.map(
						(tag, index) => ({
							displayName: tag,
							id: tagIds[index]!,
						}),
					);
				}),
			);
		}
	}

	const {
		customTitle,
		customDescription,
		preferredThumbnailId,
		isFavourite: favourite,
		rating,
		isHidden: hidden,
	} = userMedia;

	if (typeof customTitle === 'string') {
		if (customTitle.length > custom_title_max_length) {
			invalidKeys.push('userMedia.customTitle');
		} else {
			userContentUpdate.customTitle = customTitle;
		}
	} else if (customTitle === null) {
		// TODO: DEFAULTS
		userContentUpdate.customTitle = null;
	} else if (typeof customTitle !== 'undefined') {
		invalidKeys.push('userMedia.customTitle');
	}

	if (typeof customDescription === 'string') {
		if (customDescription.length > custom_description_max_length) {
			invalidKeys.push('userMedia.description');
		} else {
			userContentUpdate.customDescription = customDescription;
		}
	} else if (customDescription === null) {
		// TODO: DEFAULTS
		userContentUpdate.customDescription = null;
	} else if (typeof customDescription !== 'undefined') {
		invalidKeys.push('userMedia.customDescription');
	}

	if (typeof favourite === 'boolean') {
		userContentUpdate.isFavourite = toBoolishInt(favourite);
	} else if (favourite === null) {
		// TODO: DEFAULTS
		userContentUpdate.isFavourite = 0;
	} else if (typeof favourite !== 'undefined') {
		invalidKeys.push('userMedia.favourite');
	}

	if (typeof rating === 'number') {
		if (!ratings.includes(rating as (typeof ratings)[number])) {
			invalidKeys.push('userMedia.rating');
		} else {
			userContentUpdate.rating = rating as Rating;
		}
	} else if (rating === null) {
		// TODO: DEFAULTS
		userContentUpdate.rating = null;
	} else if (typeof rating !== 'undefined') {
		invalidKeys.push('userMedia.rating');
	}

	if (typeof hidden === 'boolean') {
		userContentUpdate.isHidden = toBoolishInt(hidden);
	} else if (hidden === null) {
		// TODO: DEFAULTS
		userContentUpdate.isHidden = 0;
	} else if (typeof hidden !== 'undefined') {
		invalidKeys.push('userMedia.hidden');
	}

	if (typeof preferredThumbnailId === 'number') {
		const valid = await db
			.selectFrom('ContentFile')
			.select('id')
			.where((eb) =>
				eb.and([
					eb('id', '=', preferredThumbnailId),
					eb('linkedContentId', '=', contentId),
					eb('category', 'in', [
						contentFileCategoriesMap.THUMB_CUSTOM,
						contentFileCategoriesMap.THUMB_GENERATED,
						contentFileCategoriesMap.THUMB_ORIGINAL,
					]),
				]),
			)
			.$call($callCheck.anyExist)
			.catch((err: unknown) => {
				logger.error(
					exitus.newError({
						message:
							'UpdateMediaController: Failed to check if a id-referenced MediaFile exists in the database.',
						caughtException: err,
					}),
				);
				res.status(500).end();
				return null;
			});
		if (valid === null) {
			return;
		}
		if (valid === false) {
			invalidKeys.push('userMedia.preferredThumbnailId');
		} else {
			userContentUpdate.preferredThumbnailId = preferredThumbnailId;
		}
	} else if (preferredThumbnailId === null) {
		userContentUpdate.preferredThumbnailId = null;
	} else if (typeof preferredThumbnailId !== 'undefined') {
		invalidKeys.push('userMedia.preferredThumbnailId');
	}

	if (invalidKeys.length !== 0) {
		return res.status(400).json({
			invalidKeys: invalidKeys,
		});
	}

	if (Object.keys(userContentUpdate).length !== 0) {
		return db
			.updateTable('UserLinkedContent')
			.set(userContentUpdate)
			.where((eb) =>
				eb.and([
					eb('UserLinkedContent.linkedContentId', '=', contentId),
					eb('UserLinkedContent.linkedUserId', '=', userId),
				]),
			)
			.execute()
			.then(() => {
				result.updates.userMedia = userContentUpdate;
				res.status(200).json(result).end();
			})
			.catch((err: unknown) => {
				logger.error(
	exitus.newError({
		kind: exitus.errorKind.unexpected,
						caughtException: err,
						message:
							'Failed to update UserMedia table with sanitised values',
						context: {
							sanisitedUpdate: userContentUpdate,
							rawUpdate: userMedia,
							userId,
						},
					}),
				);

				res.status(500).end();
			});
	} else {
		return res.status(200).json(result).end();
	}
};
