import { type RequestHandler } from 'express';
import {
	getRelatedContentData,
	type RelatedContentData,
} from '../../data/access/content.js';
import {
	type Content,
	type PlatformLinkedContent,
} from '../../data/model/tables/index.js';
import { db, logger } from '../../index.js';
import { selectFirst } from '../../libs/kysely/index.js';

export type Success = {
	record: Content.Selection & {
		[K in keyof PlatformLinkedContent.Selection]:
			| null
			| PlatformLinkedContent.Selection[K];
	};
} & RelatedContentData;
export type Failure = undefined;
export type Result = Success | Failure;

export const GetAboutContentController: RequestHandler<any, Result> = async (
	req,
	res,
) =>
	db
		.selectFrom('Content')
		.selectAll()
		.fullJoin(
			'PlatformLinkedContent',
			'Content.id',
			'PlatformLinkedContent.linkedContentId',
		)
		.selectAll('PlatformLinkedContent')
		.select('PlatformLinkedContent.id as platformLinkedContentId')
		.where('Content.id', '=', req.forwarded.content!.id!)
		.$call(selectFirst)
		.then(async (record) => {
			if (!record) {
				res.status(404).end();
				return null;
			}
			return {
				record,
				...(await getRelatedContentData({
					contentId: record.id,
					contentKind: record.kind,
					userId: req.forwarded.user!.id,
				})),
			};
		})
		.then((result) => {
			if (result === null) {
				return;
			}
			res.status(200).json(result);
		})
		.catch((err: unknown) => {
			logger.error(
				{
					error: err,
				},
				'AboutMediaController: Unhandled exception.',
			);
			res.status(500).end();
		});
