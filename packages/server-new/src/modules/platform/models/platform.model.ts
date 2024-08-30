import { type Guard, is } from 'is-guard';
import {
	getUtcSeconds,
	isNumberAndPositive,
	isNumberAndPositiveInteger,
	isStringArray,
} from '~/utils/index.js';

export interface PlatformContentMetadata {
	title?: string;
	description?: string;
	body?: string;
	ageLimit?: number;
	likeCount?: number;
	dislikeCount?: number;
	likeToDislikeRatio?: number;
	viewCount?: number;
	commentCount?: number;
	tags?: string[];
	categories?: string[];
	genres?: string[];
	datePublished?: number;
	dateLastModified?: number;
}

export interface PlatformProfileMetadata {}
export interface PlatformCommunityMetadata {}

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
	ageLimit: { guard: isNumberAndPositiveInteger },
	likeCount: { guard: isNumberAndPositiveInteger },
	dislikeCount: { guard: isNumberAndPositiveInteger },
	likeToDislikeRatio: {
		guard: isNumberAndPositive,
		formatter: (value) => Math.max(0, value),
	},
	viewCount: { guard: isNumberAndPositiveInteger },
	commentCount: { guard: isNumberAndPositiveInteger },
	tags: { guard: isStringArray },
	categories: { guard: isStringArray },
	genres: { guard: isStringArray },
	datePublished: {
		formatter: (value) => getUtcSeconds(value),
	},
	dateLastModified: {
		formatter: (value) => getUtcSeconds(value),
	},
};
export const sanitisePlatformContentMetadata = (
	metadata: PlatformContentMetadata | null | undefined,
): PlatformContentMetadata => {
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
};
