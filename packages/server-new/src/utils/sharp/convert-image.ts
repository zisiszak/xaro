import { exerr } from 'exitus';
import { join } from 'path';
import sharp, { type OutputInfo } from 'sharp';
import { trueBasename } from '~/utils/index.js';
import {
	parseAvifFormatOptions,
	parseGifFormatOptions,
	parseJpegFormatOptions,
	parsePngFormatOptions,
	parseWebpFormatOptions,
} from './format-options.js';
import {
	type ImageFormatOptions,
	type ImageOutputFormat,
	type ImageResizeSetting,
	type OutputOptions,
} from './types.js';

export type ConvertImageProps<Format extends ImageOutputFormat> = {
	inputPath: string;
	formatOptions: ImageFormatOptions<Format>;
	resize?: ImageResizeSetting;
} & OutputOptions;

export async function convertImage<Format extends ImageOutputFormat, Output extends OutputOptions>({
	inputPath,
	outputDir,
	outputFilename,
	formatOptions,
	toBuffer,
	resize,
}: ConvertImageProps<Format>): Promise<
	Output['toBuffer'] extends true ? Buffer : OutputInfo & { outputFilePath: string }
> {
	if ((!toBuffer && !outputDir) || !outputFilename) {
		throw exerr({
			message:
				'Output filename and directory are both required when not outputting to a Buffer.',
			context: {
				inputPath: inputPath,
			},
		});
	}

	let command = sharp(inputPath);

	if (typeof resize === 'number') {
		command = command.resize(resize, resize, { fit: 'inside' });
	} else if (resize) {
		const { width, height } = resize;
		command = command.resize(width, height, resize.options);
	}

	switch (formatOptions.format) {
		case '.jpeg': {
			const { quality, progressive } = parseJpegFormatOptions(
				formatOptions as ImageFormatOptions<'.jpeg'>,
			);
			command = command.jpeg({
				quality,
				progressive,
			});
			break;
		}

		case '.gif': {
			const { reuse } = parseGifFormatOptions(formatOptions as ImageFormatOptions<'.gif'>);
			command = command.gif({
				reuse,
			});
			break;
		}

		case '.png': {
			const { compressionLevel, progressive } = parsePngFormatOptions(
				formatOptions as ImageFormatOptions<'.png'>,
			);
			command = command.png({
				compressionLevel,
				progressive,
			});
			break;
		}
		case '.webp': {
			const { quality, smartSubsample, lossless, nearLossless } = parseWebpFormatOptions(
				formatOptions as ImageFormatOptions<'.webp'>,
			);
			command = command.webp({
				quality,
				smartSubsample,
				lossless,
				nearLossless,
			});
			break;
		}

		case '.avif': {
			const { quality } = parseAvifFormatOptions(
				formatOptions as ImageFormatOptions<'.avif'>,
			);
			command = command.avif({
				quality,
			});
			break;
		}

		case '.heif':
			throw exerr({
				message: 'Output format selected has not yet been implemented.',
				context: {
					outputFormat: formatOptions.format,
					inputFilePath: inputPath,
				},
			});
		default:
			throw exerr({
				message: 'Unsupported output format.',
				context: {
					outputFormat: formatOptions.format,
					inputFilePath: inputPath,
				},
			});
	}

	const outputFilePath = join(outputDir, trueBasename(outputFilename) + formatOptions.format);

	if (toBuffer)
		return command.toBuffer() as Promise<
			Output['toBuffer'] extends true ? Buffer : OutputInfo & { outputFilePath: string }
		>;
	return command.toFile(outputFilePath).then((output) => ({
		...output,
		outputFilePath,
	})) as Promise<
		Output['toBuffer'] extends true ? Buffer : OutputInfo & { outputFilePath: string }
	>;
}
