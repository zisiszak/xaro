import { newError } from 'exitus';
import path from 'path';
import sharp, { type OutputInfo } from 'sharp';
import { trueBasename } from '~/utils/index.js';
import {
	parseAvifFormatOptions,
	parseGifFormatOptions,
	parseJpegFormatOptions,
	parsePngFormatOptions,
	parseWebpFormatOptions,
} from './format-options.js';
import { type FormatOptions, type OutputFormat, type OutputOptions } from './types.js';

export type ConvertImageProps<Format extends OutputFormat> = {
	inputPath: string;
	formatOptions: FormatOptions<Format>;
	resize?: {
		width?: number;
		height?: number;
	};
} & OutputOptions;

export async function convertImage<Format extends OutputFormat, Output extends OutputOptions>({
	inputPath: inputFilePath,
	outputDir,
	outputFilename,
	formatOptions,
	toBuffer,
	resize,
}: ConvertImageProps<Format>): Promise<Output['toBuffer'] extends true ? Buffer : OutputInfo> {
	if ((!toBuffer && !outputDir) || !outputFilename) {
		throw newError({
			message:
				'Output filename and directory are both required when not outputting to a Buffer.',
			log: 'error',
			context: {
				inputPath: inputFilePath,
			},
		});
	}

	let command = sharp(inputFilePath);

	if (resize) {
		const { width, height } = resize;
		command = command.resize(width, height);
	}

	switch (formatOptions.format) {
		case '.jpeg': {
			const { quality, progressive } = parseJpegFormatOptions(
				formatOptions as FormatOptions<'.jpeg'>,
			);
			command = command.jpeg({
				quality,
				progressive,
			});
			break;
		}

		case '.gif': {
			const { reuse } = parseGifFormatOptions(formatOptions as FormatOptions<'.gif'>);
			command = command.gif({
				reuse,
			});
			break;
		}

		case '.png': {
			const { compressionLevel, progressive } = parsePngFormatOptions(
				formatOptions as FormatOptions<'.png'>,
			);
			command = command.png({
				compressionLevel,
				progressive,
			});
			break;
		}
		case '.webp': {
			const { quality, smartSubsample, lossless, nearLossless } = parseWebpFormatOptions(
				formatOptions as FormatOptions<'.webp'>,
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
			const { quality } = parseAvifFormatOptions(formatOptions as FormatOptions<'.avif'>);
			command = command.avif({
				quality,
			});
			break;
		}

		case '.heif':
			throw newError({
				message: 'Output format selected has not yet been implemented.',
				log: 'error',
				context: {
					outputFormat: formatOptions.format,
					inputFilePath,
				},
			});
		default:
			throw newError({
				message: 'Unsupported output format.',
				log: 'warn',
				context: {
					outputFormat: formatOptions.format,
					inputFilePath,
				},
			});
	}

	return (
		toBuffer
			? command.toBuffer()
			: command.toFile(
					path.join(outputDir, trueBasename(outputFilename) + formatOptions.format),
				)
	) as Promise<Output['toBuffer'] extends true ? Buffer : OutputInfo>;
}
