import { type RequestHandler } from 'express';
import { imageExtensions } from '../../data/model/shared/content-kinds.js';
import { type ContentFile } from '../../data/model/tables/index.js';
import { contentFileCategoriesMap } from '../../exports.js';
import { db } from '../../index.js';

export type Success = ContentFile.Selection[];
export type Failure = undefined;
export type Result = Success | Failure;

export const GetContentThumbnailFilesController: RequestHandler<
	never,
	Result
> = async (req, res) => {
	// const user = req.user!;
	const contentId = req.forwarded.content!.id!;

	const thumbs = await db
		.selectFrom('ContentFile')
		.selectAll()
		.where('linkedContentId', '=', contentId)
		.innerJoin('Content', 'Content.id', 'ContentFile.linkedContentId')
		.select('Content.id as linkedContentId')
		.where((eb) =>
			eb.and([
				eb('ContentFile.removed', '!=', 1),
				eb('ContentFile.linkedContentId', '=', contentId),
				eb.or([
					eb('ContentFile.category', 'in', [
						contentFileCategoriesMap.THUMB_CUSTOM,
						contentFileCategoriesMap.THUMB_GENERATED,
						contentFileCategoriesMap.THUMB_ORIGINAL,
					]),
					eb.and([
						eb('ContentFile.category', 'in', [
							contentFileCategoriesMap.OPTIMISED,
							contentFileCategoriesMap.ORIGINAL,
							contentFileCategoriesMap.CONVERSION,
							contentFileCategoriesMap.RESIZE,
						]),
						eb('ContentFile.extension', 'in', imageExtensions),
					]),
				]),
			]),
		)
		.execute();

	res.status(200).json(thumbs);
};
