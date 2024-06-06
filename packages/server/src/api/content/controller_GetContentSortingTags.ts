import { RequestHandler } from 'express';
import { SqlBool, sql } from 'kysely';
import { errorOutcome } from '~/exports.js';
import { db, logger } from '~/index.js';
import { ContentFiltering, parseContentFiltering } from './shared.js';

interface UserSortingTagDetails {
	id: number;
	displayName: string;
	count: number;
}

export type Query = ContentFiltering;
export interface Success {
	sortingTags: UserSortingTagDetails[];
}
export type Failure = undefined;
export type Result = Success | Failure;

export const GetContentSortingTagsController: RequestHandler<
	never,
	Result,
	never,
	Query
> = async (req, res) => {
	const userId = req.forwarded.user!.id;
	const query = req.query;
	const {
		search,
		platform,
		contentKind,
		platformCommunity,
		platformCommunityId,
		platformId,
		platformProfile,
		platformProfileId,
		minRating,
		isFavourite,
		// sortingTags,
	} = parseContentFiltering(query);

	const likeSearch = `%${search ?? ''}%`;

	let q = db
		.selectFrom('SortingTag')
		.innerJoin(
			'SortingTagLinkedContent',
			'SortingTag.id',
			'SortingTagLinkedContent.linkedSortingTagId',
		)
		.select([
			'SortingTag.displayName',
			'SortingTag.id as id',
			'SortingTagLinkedContent.linkedSortingTagId as id',
		])
		.where((eb) =>
			eb.or([
				eb('SortingTag.linkedUserId', '=', userId),
				eb('SortingTag.linkedUserId', 'is', null),
			]),
		)
		.select((sb) =>
			sb.fn
				.count<number>('SortingTagLinkedContent.linkedContentId')
				.filterWhere('SortingTag.id', 'in', (eb) =>
					eb
						.selectFrom('SortingTagLinkedContent')
						.innerJoin(
							'Content',
							'SortingTagLinkedContent.linkedContentId',
							'Content.id',
						)
						.innerJoin(
							'UserLinkedContent',
							'Content.id',
							'UserLinkedContent.linkedContentId',
						)
						.select([
							// 'Content.id as linkedContentId',
							// 'UserLinkedContent.linkedContentId as linkedContentId',
							'SortingTagLinkedContent.linkedSortingTagId as id',
						])
						.where((eb) =>
							eb.and(
								[
									contentKind
										? eb('Content.kind', '=', contentKind)
										: null,
									typeof isFavourite !== 'undefined'
										? eb(
												'UserLinkedContent.isFavourite',
												'=',
												isFavourite,
											)
										: null,
									typeof minRating === 'number'
										? eb(
												'UserLinkedContent.rating',
												'>=',
												minRating,
											)
										: null,
									search
										? eb(
												'SortingTag.displayName',
												'like',
												likeSearch,
											)
										: null,
									typeof platformId !== 'undefined' ||
									typeof platform !== 'undefined' ||
									typeof platformCommunity !== 'undefined' ||
									typeof platformCommunityId !==
										'undefined' ||
									typeof platformProfile !== 'undefined' ||
									typeof platformProfileId !== 'undefined'
										? eb('Content.id', 'in', (eb) =>
												eb
													.selectFrom(
														'PlatformLinkedContent',
													)
													.select(
														'PlatformLinkedContent.linkedContentId as id',
													)
													.where((eb) =>
														eb.and(
															[
																typeof platformId !==
																	'undefined' ||
																typeof platformId !==
																	'undefined'
																	? eb(
																			'PlatformLinkedContent.linkedPlatformId',
																			typeof platformId !==
																				'undefined'
																				? '='
																				: 'in',
																			typeof platformId !==
																				'undefined'
																				? platformId
																				: sql<number>`(SELECT Platform.id as linkedPlatformId from Platform WHERE Platform.name = ${platform})`,
																		)
																	: null,
																typeof platformProfile !==
																	'undefined' ||
																typeof platformProfileId !==
																	'undefined'
																	? eb(
																			'PlatformLinkedContent.linkedPlatformProfileId',
																			typeof platformProfileId !==
																				'undefined'
																				? '='
																				: 'in',
																			typeof platformProfileId !==
																				'undefined'
																				? platformProfileId
																				: sql<number>`(SELECT PlatformProfile.id as linkedPlatformProfileId FROM PlatformProfile WHERE PlatformProfile.name LIKE ${`%${platformProfile!}%`})`,
																		)
																	: null,
																typeof platformCommunity !==
																	'undefined' ||
																typeof platformCommunityId !==
																	'undefined'
																	? eb(
																			'PlatformLinkedContent.linkedPlatformCommunityId',
																			typeof platformCommunityId !==
																				'undefined'
																				? '='
																				: '=',
																			typeof platformCommunityId !==
																				'undefined'
																				? platformCommunityId
																				: sql<number>`(SELECT PlatformCommunity.id as linkedPlatformCommunityId from PlatformCommunity WHERE PlatformCommunity.name LIKE ${`%${platformCommunity!}%`})`,
																		)
																	: null,

																search
																	? sql<SqlBool>`
													PlatformLinkedContent.sourceUrl = ${search}
													OR PlatformLinkedContent.sourcePageUrl = ${search}
													OR PlatformLinkedContent.description LIKE ${likeSearch}
													OR PlatformLinkedContent.title LIKE ${likeSearch}
													OR PlatformLinkedContent.linkedPlatformProfileId IN (
														SELECT PlatformProfile.id as linkedPlatformProfileId FROM PlatformProfile
														WHERE (
															PlatformProfile.name LIKE ${likeSearch}
															OR PlatformProfile.displayName LIKE ${likeSearch}
														)
													)
													OR PlatformLinkedContent.linkedPlatformCommunityId IN (
														SELECT PlatformCommunity.id as linkedPlatformCommunityId FROM PlatformCommunity
														WHERE (
															PlatformCommunity.name LIKE ${likeSearch}
															OR PlatformCommunity.displayName LIKE ${likeSearch}
														)
													)
													OR PlatformLinkedContent.sourceId = ${search}
													OR PlatformLinkedContent.tags LIKE ${likeSearch}
													OR PlatformLinkedContent.categories LIKE ${likeSearch}
													OR PlatformLinkedContent.genres LIKE ${likeSearch}
													`
																	: null,
															].filter(
																<T>(
																	v: T | null,
																): v is T =>
																	v !== null,
															),
														),
													),
											)
										: null,
								].filter(
									<T>(v: T | null): v is T => v !== null,
								),
							),
						),
				)
				.as('count'),
		)
		.groupBy('SortingTagLinkedContent.linkedSortingTagId');

	// if (sortingTags) {
	// 	q = q.where('SortingTag.displayName', 'in', sortingTags);
	// }

	return q
		.execute()
		.then((results) => {
			res.status(200)
				.json({
					sortingTags: results.filter((tag) => tag.count > 0),
				})
				.end();
		})
		.catch((err) => {
			logger.error(
				errorOutcome({
					message: 'Failed to get content sorting tags.',
					caughtException: err,
				}),
			);
			res.status(500).end();
		});
};
