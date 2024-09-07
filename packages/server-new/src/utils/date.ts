import { exerr } from 'exitus';
import { logger } from '~/index.js';

const millisecond_epoch_min = 10000000000;

export function getUtcSeconds(
	value: number | Date | string,
	mode: 's' | 'ms' | 'auto' = 'auto',
): number | undefined {
	let date: Date;

	try {
		if (value instanceof Date) {
			date = value;
		} else if (
			typeof value === 'number' &&
			(mode === 's' || (mode === 'auto' && value < millisecond_epoch_min))
		) {
			date = new Date(value * 1000);
		} else {
			date = new Date(value);
		}

		return date.getUTCSeconds();
	} catch (err) {
		logger.error(
			exerr({
				message: 'Failed to parse date value.',
				caughtException: err,
				context: {
					value,
					mode,
				},
			}),
		);
		return undefined;
	}
}
