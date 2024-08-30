import { type Guard, is } from 'is-guard';
import { getUtcSeconds } from '~/utils/date.js';
import { isNumberAndPositive, isNumberAndPositiveInteger, isStringArray } from '~/utils/guards.js';

export interface PlatformContentMetadata {
	title?: string;
	description?: string;
	body?: string;
	age_limit?: number;
	like_count?: number;
	dislike_count?: number;
	like_to_dislike_ratio?: number;
	view_count?: number;
	comment_count?: number;
	tags?: string[];
	categories?: string[];
	genres?: string[];
	date_published?: number;
	date_last_modified?: number;
}

const propertyMap: Required<{
	[K in keyof PlatformContentMetadata]: {
		guard?: Guard<NonNullable<PlatformContentMetadata[K]>>;
		formatter?: (
			value: NonNullable<PlatformContentMetadata[K]>,
		) => NonNullable<PlatformContentMetadata[K]> | undefined;
	};
}> = {
	title: { guard: is.string },
	description: { guard: is.string },
	body: { guard: is.string },
	age_limit: { guard: isNumberAndPositiveInteger },
	like_count: { guard: isNumberAndPositiveInteger },
	dislike_count: { guard: isNumberAndPositiveInteger },
	like_to_dislike_ratio: {
		guard: isNumberAndPositive,
		formatter: (value) => Math.max(0, value),
	},
	view_count: { guard: isNumberAndPositiveInteger },
	comment_count: { guard: isNumberAndPositiveInteger },
	tags: { guard: isStringArray },
	categories: { guard: isStringArray },
	genres: { guard: isStringArray },
	date_published: {
		formatter: (value) => getUtcSeconds(value),
	},
	date_last_modified: {
		formatter: (value) => getUtcSeconds(value),
	},
};
export function sanitisePlatformContentMetadata(
	metadata: PlatformContentMetadata | null | undefined,
): PlatformContentMetadata {
	const result: PlatformContentMetadata = {};

	if (typeof metadata === 'object' && metadata !== null) {
		(Object.keys(metadata) as Array<keyof PlatformContentMetadata>).forEach((key) => {
			const value = metadata[key];
			if (typeof value === 'undefined' || value === null) return;

			const { guard, formatter } = propertyMap[key];
			if (guard && !guard(value)) return;

			if (formatter) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				const formatted = (formatter as (v: typeof value) => typeof value | undefined)(
					value,
				);
				if (typeof formatted === 'undefined') return;

				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				result[key] = formatted as any;
			} else {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				result[key] = value as any;
			}
		});
	}

	return result;
}
