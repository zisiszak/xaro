import { errorKind, isError, newError } from 'exitus';
import { type RequestHandler } from 'express';
import path from 'path';
import { contentFileExtensionMap } from '../../data/model/shared/content-kinds.js';
import { type MediaUploadParams } from '../../data/model/tables/ContentUpload.js';
import { config, db, logger } from '../../index.js';

export type Body = {
	params: MediaUploadParams;
	fileHash: string;
	originalFileName: string;
};
export type Failure = undefined;
export type Success = {
	status: 'SUCCESS';
	payload: {
		uploadId: number;
	};
};
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
export type Result = Failure | Success;

export const RegisterNewContentUploadController: RequestHandler<never, Result, Body> = async (
	req,
	res,
) => {
	const { id: userId } = req.forwarded.user!;
	const { params, fileHash, originalFileName } = req.body;
	if (
		!params ||
		!fileHash ||
		!originalFileName ||
		(params.kind !== 'thumbnail' && params.kind !== 'media') ||
		(params.kind === 'thumbnail' && typeof params.forContentId === 'undefined')
	) {
		newError({
			kind: errorKind.params,
			log: 'error',
			message: 'Invalid body syntax',
			context: {
				body: req.body,
				userId: userId,
			},
		});
		return res.status(400).end();
	}

	if (path.extname(originalFileName) in contentFileExtensionMap === false) {
		newError({
			message: 'Unsupported file format.',
			log: 'error',
			context: {
				userId,
				originalFileName,
			},
		});
		return res.status(400).end();
	}

	// Check to see if the hash is alredy in the database. If not, we add a row to the `MediaUpload` table representing this item.

	return db
		.selectFrom('ContentFile')
		.select('id')
		.where('hash', '=', fileHash)
		.executeTakeFirst()
		.then((exists) => {
			if (exists) {
				res.status(400).end();
				const outcome = newError({
					message: 'File hash already exists in database',
					log: 'error',
				});
				return Promise.reject(outcome);
			}

			const destinationFilePath = path.relative(
				config.libraryDir,
				path.join(config.awaitingImportDir, fileHash + path.extname(originalFileName)),
			);

			return db
				.insertInto('ContentUpload')
				.values({
					linkedUserId: userId,
					clientFileHash: fileHash,
					destinationFilePath,
					originalFileName,
					// TODO: make this a bit safer
					params: JSON.stringify(params satisfies MediaUploadParams),
				})
				.executeTakeFirstOrThrow();
		})
		.then((result) => {
			res.status(201).json({
				status: 'SUCCESS',
				payload: {
					uploadId: Number(result.insertId!),
				},
			});
		})
		.catch((err) => {
			logger.error(
				isError(err)
					? err
					: newError({
							caughtException: err,
							message: 'Unhandled exception',
						}),
			);
			res.status(500).end();
		});
};
