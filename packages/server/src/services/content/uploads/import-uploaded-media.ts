import { contentFileCategoriesMap } from '../../../data/model/shared/content-file-categories.js';
import { db } from '../../../index.js';
import { errorOutcome } from '../../../utils/outcomes.js';
import { importContent } from '../import.js';

export const importUploadedContent = async (contentUploadId: number) =>db
		.selectFrom('ContentUpload')
		.selectAll()
		.where((eb) =>
			eb.and([
				eb('id', '=', contentUploadId),
				eb('status', '=', 'COMPLETE'),
			]),
		)
		.executeTakeFirstOrThrow()
		.then<void>((result) => {
			if (result.params.kind === 'thumbnail') {
				return Promise.reject(
					errorOutcome({
						message: 'Thumbnail upload not yet implemented.',
						context: result,
					}),
				);
			}

			if (result.params.kind === 'media') {
				return importContent({
					userId: result.linkedUserId,
					sources: {
						main: {
							kind: 'file',
							category: contentFileCategoriesMap.ORIGINAL,
							currentFilePath: result.destinationFilePath,
							hash: result.clientFileHash,
							originalFilename: result.originalFileName,
						},
					},
					metadata: {
						user: {
							customDescription: result.params.customDescription,
							customTitle: result.params.customTitle,
						},
					},
					options: {
						generateDefaultThumbnails:
							result.params.generateDefaultThumbnails,
						createOptimisedMedia:
							result.params.createOptimisedMedia,
					},
				}).then(() =>
					db
						.deleteFrom('ContentUpload')
						.where('id', '=', contentUploadId)
						.execute()
						.then(() => {}),
				);
			}
		});
