import { cleanInt, cleanString, cleanStringArray } from '@xaro/utils';
import { Rating, ratings } from '~/data/model/tables/UserLinkedContent.js';
import { BoolishInt } from '~/utils/types-and-guards/index.js';

export interface ContentFiltering {
	platform?: string;
	platformId?: number;
	platformProfile?: string;
	platformProfileId?: number;
	platformCommunity?: string;
	platformCommunityId?: number;
	contentKind?: string;
	search?: string;
	isFavourite?: boolean;
	minRating?: number;
	sortingTags?: string[];
}

export interface ParsedContentFiltering {
	platform?: string;
	platformId?: number;
	platformProfile?: string;
	platformProfileId?: number;
	platformCommunity?: string;
	platformCommunityId?: number;
	search?: string;
	isFavourite?: BoolishInt;
	minRating?: Rating;
	contentKind?: 'video' | 'image';
	sortingTags?: string[];
}

export function parseContentFiltering(
	filters: ContentFiltering,
): ParsedContentFiltering {
	return {
		search: cleanString(filters.search),
		platform: cleanString(filters.platform),
		contentKind:
			filters.contentKind === 'video'
				? 'video'
				: filters.contentKind === 'image'
					? 'image'
					: undefined,
		platformId: cleanInt(filters.platformId),
		platformCommunity: cleanString(filters.platformCommunity),
		platformCommunityId: cleanInt(filters.platformCommunityId),
		minRating: ratings.includes(cleanInt(filters.minRating) as Rating)
			? (cleanInt(filters.minRating) as Rating)
			: undefined,
		isFavourite: filters.isFavourite
			? 1
			: filters.isFavourite === false
				? 0
				: undefined,
		platformProfile: cleanString(filters.platformProfile),
		platformProfileId: cleanInt(filters.platformProfileId),
		sortingTags: cleanStringArray(filters.sortingTags),
	};
}
