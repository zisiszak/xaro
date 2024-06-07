import { GenericError, isError, newError } from 'exitus';
import type Ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { logger } from '~/index.js';
import { videoExtensions } from '../../../data/model/shared/content-kinds.js';
import { sequentialAsync } from '../../../utils/async/sequential-async.js';
import { type DeepFreeze } from '../../../utils/types-and-guards/index.js';
import { useFfmpeg } from '../use-ffmpeg.js';
import { parsePropsFactory, type ThumbnailConfig } from './parse-props.js';

const NUMBER_AFTER_UNDERSCORE = /(?<=_)\d+/;
const supportedExtensions = [...videoExtensions, '.gif'] as const;

export interface GeneratedThumbnail {
	index: number;
	filename: string;
	filepath: string;
	timestamp: string | null;
}

export interface GenerateThumbnailsProps {
	filePath: string;
	outputDir: string;
	thumbnails: ThumbnailConfig[];
}
/**
 * @throws Throws an ErrorOutcome if an unsupported file type is provided.
 */
export async function generateThumbnails({
	filePath,
	outputDir,
	thumbnails,
}: DeepFreeze<GenerateThumbnailsProps>): Promise<GeneratedThumbnail[]> {
	const extension = path.extname(filePath) as (typeof supportedExtensions)[number];
	if (!supportedExtensions.includes(extension)) {
		return Promise.reject(
			newError({
				message: 'Unsupported file type',
				context: {
					filePath: filePath,
				},
			}),
		);
	}

	const trueBasename = path.basename(filePath, extension);

	const configs = thumbnails.map(parsePropsFactory(trueBasename));
	const ffmpeg = useFfmpeg(filePath);

	return sequentialAsync(
		async ({ size, filename, timestamps, count }, index) => {
			const props = {
				filename,
				folder: outputDir,
				size,
			} as Ffmpeg.ScreenshotsConfig;
			// Have to do this because Fluent-Ffmpeg doesn't check if a key actually has a defined value for certain properties.
			timestamps && (props.timestamps = timestamps);
			count && (props.count = count);

			return new Promise<GeneratedThumbnail | GenericError>((resolve) => {
				try {
					ffmpeg
						.input(filePath)
						.screenshot(props)
						.on('end', () => {
							const f = filename + '.png';
							const parsedFileIndex = filename.match(NUMBER_AFTER_UNDERSCORE);
							const parsedTimestamp =
								parsedFileIndex !== null && parsedFileIndex.length > 0
									? timestamps?.[parseInt(parsedFileIndex[0])]?.toString() ?? null
									: null;

							resolve({
								index: index,
								filename: f,
								filepath: path.join(outputDir, f),
								timestamp: parsedTimestamp,
							});
						});
				} catch (error) {
					const outcome = newError({
						message: 'Unexpected error while attempting screenshot via ffmpeg.',
						context: {
							fileName: filename,
							size,
							timestamps,
							count,
							index,
						},
						caughtException: error,
					});
					logger.error(outcome);
					resolve(outcome);
				}
			});
		},
		configs,
		true,
	).then((results) => results.filter(<T>(v: T | GenericError): v is T => !isError(v)));
}
