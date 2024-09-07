import { exerr, isExerr, type GenericExerr } from 'exitus';
import type Ffmpeg from 'fluent-ffmpeg';
import path, { extname } from 'path';
import { sequentialAsync, type DeepFreeze } from '~/utils/index.js';
import { newFfmpeg } from '../new-ffmpeg.js';
import { parsePropsFactory, type ThumbnailConfig } from './parse-props.js';

const NUMBER_AFTER_UNDERSCORE = /(?<=_)\d+/;

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
	const ext = extname(filePath);

	const basename = path.basename(filePath, ext);

	const configs = thumbnails.map(parsePropsFactory(basename));
	const ffmpeg = newFfmpeg(filePath);

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

			return new Promise<GeneratedThumbnail | GenericExerr>((resolve) => {
				try {
					ffmpeg
						.input(filePath)
						.screenshot(props)
						.on('end', () => {
							const f = filename + '.png';
							const parsedFileIndex = filename.match(NUMBER_AFTER_UNDERSCORE);
							const parsedTimestamp =
								parsedFileIndex !== null && parsedFileIndex.length > 0
									? (timestamps?.[parseInt(parsedFileIndex[0])]?.toString() ??
										null)
									: null;

							resolve({
								index: index,
								filename: f,
								filepath: path.join(outputDir, f),
								timestamp: parsedTimestamp,
							});
						});
				} catch (err) {
					const outcome = exerr({
						message: 'Unexpected error while attempting screenshot via ffmpeg.',
						context: {
							fileName: filename,
							size,
							timestamps,
							count,
							index,
						},
						caughtException: err,
					});
					resolve(outcome);
				}
			});
		},
		configs,
		true,
	).then((results) => results.filter(<T>(v: T | GenericExerr): v is T => !isExerr(v)));
}
