import { exitus } from 'exitus';
import { type RequestHandler } from 'express';
import formidable from 'formidable';
import path from 'path';
import { config, db, logger } from '../../index.js';
import { importUploadedContent } from '../../services/content/uploads/import-uploaded-media.js';

export type Params = {
	clientFileHash: string;
};

export const UploadContentFileController: RequestHandler<Params> = async (
	req,
	res,
) => {
	const userId = req.forwarded.user!.id;
	const { clientFileHash } = req.params;

	let absoluteDestinationFilePath: string;
	let uploadId: number;

	return (
		db
			.selectFrom('ContentUpload')
			.select([
				'id',
				'clientFileHash',
				'ContentUpload.destinationFilePath',
				'ContentUpload.linkedUserId',
				'ContentUpload.status',
			])
			.where((eb) =>
				eb.and([
					eb('clientFileHash', '=', clientFileHash),
					eb('linkedUserId', '=', userId),
					eb('status', '!=', 'COMPLETE'),
				]),
			)
			.executeTakeFirst()
			.then((result) => {
				if (!result) {
					res.status(404).end();
					return Promise.reject(
						exitus.newError({
							message:
								'Registered upload item not found in database.',
							context: {
								userId,
								clientFileHash,
							},
						}),
					);
				}

				uploadId = result.id;
				absoluteDestinationFilePath = path.join(
					config.libraryDir,
					result.destinationFilePath,
				);

				return formidable({
					multiples: false,
					filename: () => path.basename(result.destinationFilePath),
					hashAlgorithm: 'SHA-1',
					uploadDir: path.dirname(absoluteDestinationFilePath),
					maxFileSize: 16 * 1024 ** 3,
				}).parse<never, 'media'>(req);
			})
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.then(async ([_, files]) => {
				if (!files.media || !files.media[0]) {
					res.status(400).end();
					return Promise.reject(
						exitus.newError(
							{
								message:
									'No uploaded files found in media property.',
								context: {
									userId,
									clientFileHash,
									files,
								},
							},
						),
					);
				}

				const { filepath, newFilename, originalFilename, size, hash } =
					files.media[0];
				if (hash !== clientFileHash) {
					res.status(400).end();
					return Promise.reject(
						exitus.newError(
							{
								message:
									'Client file hash does not match uploaded file hash.',
								context: {
									uploadId,
									hash,
									clientFileHash,
									userId,
									originalFilename,
									newFilename,
									size,
								},
							},
						),
					);
				}

				if (filepath !== absoluteDestinationFilePath) {
					res.status(500).end();
					return Promise.reject(
						exitus.newError(
							{
								kind: exitus.errorKind.unexpected,
								message:
									'Upload filepath does not match destination filepath',
								context: {
									uploadId,
									filepath,
									absoluteDestinationFilePath,
									clientFileHash,
								},
							},
						),
					);
				}

				return db
					.updateTable('ContentUpload')
					.set({
						status: 'COMPLETE',
					})
					.where('id', '=', uploadId)
					.execute();
			})
			.then(() => importUploadedContent(uploadId))
			.then(() => {
				res.status(200).end();
			})
			.catch((err: unknown) => {
				logger.error(exitus.isError(err) ? err :
			exitus.newError({
				kind: exitus.errorKind.unknown,message: 'Unhandled exception',
				caughtException: err,
				context: {
					userId,
					clientFileHash,
				},
			})
			);
				return res.status(500).end();
			})
	);
};
