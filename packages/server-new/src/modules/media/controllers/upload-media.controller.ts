import { type RequestHandler } from 'express';
import formidable from 'formidable';
import { logger } from '~/index.js';
import { OriginalFile } from '~/modules/files/managers/OriginalFile.js';
import { fileFS } from '~/modules/files/repositories/file.fs.js';
import { sequentialAsync } from '~/utils/sequential-async.js';
import { Media } from '../managers/Media.js';
import { FileToMediaRelationshipEnum } from '../models/file-to-media.js';

export interface Status201_Uploaded {}

export const uploadMediaController: RequestHandler = async (req, res) => {
	const userID = req.userAccessToken!.userID;

	const form = formidable({
		maxFiles: 50,
		hashAlgorithm: false,
		multiples: true,
		allowEmptyFiles: false,
		uploadDir: fileFS.tempDirectory,
		keepExtensions: true,
		filename: (name, ext) => `${name}${ext}`,
	});

	await new Promise<{
		mediaItems: {
			files: formidable.File[];
			key: string;
			// fields
		}[];
		globalFields: unknown;
	} | null>((resolve) => {
		form.parse<string, string>(req, (err, fields, files) => {
			if (err) {
				res.status(500).end();
				logger.error(err);
				return resolve(null);
			}

			const fileFields = Object.entries(fields).filter(([fieldName]) =>
				fieldName.startsWith('item-'),
			);

			const items: { files: formidable.File[]; key: string }[] = [];

			Object.entries(files).forEach(([itemKey, fileList]) => {
				if (!fileList || fileList.length === 0) {
					logger.warn({ key: itemKey }, 'missing file list for key');
					return;
				}

				const fields = Object.fromEntries(
					fileFields
						.filter(([fieldName]) => fieldName.startsWith(`item-${itemKey}-`))
						.map(
							([fieldName, value]) =>
								[
									fieldName.slice(`item-${itemKey}-`.length),
									Array.isArray(value) ? value[0] : value,
								] as const,
						),
				);

				const result: { files: formidable.File[]; key: string } = {
					files: fileList,
					key: itemKey,
					...fields,
				};
				items.push(result);
			});

			if (items.length === 0) {
				res.status(400).end();
				logger.error('No files were uploaded.');
				return resolve(null);
			}

			resolve({ mediaItems: items, globalFields: {} });
		});
	})
		.then(async (result) => {
			if (!result) return;
			const { mediaItems: items } = result;

			await sequentialAsync(async (item) => {
				const file = item.files[0]!;

				const { fileID, isDuplicate } = await OriginalFile.importOriginalFile(
					file.filepath,
					{
						originalFileName: file.originalFilename,
					},
				);
				await OriginalFile.linkToUser(fileID, userID);

				if (isDuplicate) return void res.status(409).end();

				const mediaID = await Media.create();
				await Media.linkToUser(mediaID, userID);
				await OriginalFile.linkToMedia(fileID, mediaID, FileToMediaRelationshipEnum.Media);

				// TEMPORARY
				try {
					const originalFile = await OriginalFile.fromOriginalFileID(fileID);
					await originalFile.generateOptimisedFiles();
					await originalFile.generateDefaultThumbnail();
				} catch (err) {
					logger.error(err, 'Whoops?');
				}
			}, items);

			res.status(201).end();
		})
		.catch((err) => {
			logger.error(err);
			res.status(500).end();
		});
};
