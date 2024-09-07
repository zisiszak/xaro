import { type ResizeOptions } from 'sharp';

const outputFormats = ['.jpeg', '.png', '.webp', '.gif', '.avif', '.heif'] as const;
export type ImageOutputFormat = (typeof outputFormats)[number];

export type ImageResizeSetting =
	| number
	| {
			options?: ResizeOptions;
			width?: number;
			height?: number;
	  };

export type ImageFormatOptions<Format extends ImageOutputFormat> = {
	format: Format;
} & (Format extends '.jpeg'
	? {
			/** `0` to `100` */
			quality?: number;

			/** @default false */
			progressive?: boolean;
		}
	: Format extends '.webp'
		? {
				/** `0` to `100` */
				quality?: number;
				smartSubsample?: boolean;
				lossless?: boolean;
				nearLossless?: boolean;
			}
		: Format extends '.gif'
			? {
					reuse?: boolean;
				}
			: Format extends '.png'
				? {
						/** `0` to `9` */
						compressionLevel?: number;

						/** @default false */
						progressive?: boolean;
					}
				: Format extends '.avif'
					? {
							quality?: number;
						}
					: unknown);

export type OutputOptions =
	| {
			toBuffer?: false;
			outputDir: string;

			/**
			 * Output filename should exclude the extension
			 * @remarks If an output filename is not provided, then a buffer is returned. */
			outputFilename: string;
	  }
	| {
			toBuffer: true;
			outputDir?: undefined;
			outputFilename?: undefined;
	  };
