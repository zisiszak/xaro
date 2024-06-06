import { is } from 'is-guard';

type ThumbnailTimestamp = number | `{number}%`;
type ThumbnailSize =
	| {
			width: number;
			height?: number;
	  }
	| {
			width?: number;
			height: number;
	  };

interface FfmpegThumbnailSettings {
	size: string;
	timestamps?: string[];
	count?: number;
	filename: string;
}

type TimestampThumbnailConfig = ThumbnailSize & {
	label: string;
	timestamps: ThumbnailTimestamp[];
};
type CountThumbnailConfig = ThumbnailSize & {
	count?: number;
	label: string;
};
export type ThumbnailConfig = TimestampThumbnailConfig | CountThumbnailConfig;

function formatTimestamps(
	timestamps: readonly Readonly<ThumbnailTimestamp>[],
): string[] {
	return timestamps.map((ts) => {
		let timestamp: string | undefined = undefined;
		if (typeof ts === 'number') {
			if (ts >= 0) {
				timestamp = ts.toString();
			}
		} else if (ts.endsWith('%')) {
			const value = parseFloat(ts.slice(undefined, -1));
			if (value >= 0 && value <= 100) {
				timestamp = `${value}%`;
			}
		}

		if (timestamp === undefined) {
			throw new Error(`Invalid timestamp: ${ts}`);
		}

		return timestamp;
	});
}
function formatSizeString({ width, height }: Readonly<ThumbnailSize>): string {
	const safeWidth =
		typeof width === 'number'
			? Math.round(Math.max(0, width))
			: ('?' as const);
	const safeHeight =
		typeof height === 'number'
			? Math.round(Math.max(0, height))
			: ('?' as const);
	if (safeWidth === '?' && safeHeight === '?') {
		throw new Error('Invalid dimensions');
	}
	return `${safeWidth}x${safeHeight}`;
}

export const parsePropsFactory =
	(trueBasename: string) => (props: Readonly<ThumbnailConfig>) => {
		const result = {
			size: formatSizeString(props),
		} as FfmpegThumbnailSettings;

		if ('timestamps' in props) {
			result.timestamps = formatTimestamps(props.timestamps);
		} else {
			const count = typeof props.count === 'number' ? props.count : 1;
			if (count < 1) {
				throw new Error('Invalid count');
			}
			result.count = count;
		}

		result.filename = `${trueBasename}_${props.label}${(typeof result.count === 'number' && result.count > 1) || is.array(result.timestamps) ? `_%i` : ''}@${result.size.replace('?', 'auto')}`;

		return result;
	};
