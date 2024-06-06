// this needs to be saved as a file or something, since changing these params for an existing library could result in code breaking.
// TODO: Implement a way of allowing these params to be updated that also accounts for side-effects (i.e. if min password length requirement is reduced, user accounts in violation should be flagged as such, and prompted for update.)

import { type Person } from '../data/model/tables/index.js';
import { type ThumbnailConfig } from '../libs/ffmpeg/thumbnails/parse-props.js';
import { deepFreeze } from '../utils/types-and-guards/index.js';

export interface __CoreParams {
	userMinPasswordLength: number;
	userMinUsernameLength: number;
	/** in ms */
	userAccessTokenExpiry: number;
	userPasswordHashAlgorithm: 'sha256';

	defaultPerson: Person.Insertion;

	contentFileOptimisation: {
		labels: string[];
		configs: {
			label: string;
			longEdge: number;
			quality: number;
		}[];
	};

	contentDefaultThumbnails: ThumbnailConfig[];
}

/**
 * These parameters directly impact core logic of the server.
 *
 * **DO NOT CHANGE UNLESS ALL SIDE-EFFECTS HAVE BEEN CONSIDERED + ACCOUNTED FOR!**
 */
export const __coreParams = deepFreeze({
	userMinPasswordLength: 8,
	userMinUsernameLength: 3,
	/** (`1000 * 60 * 60 * 24 * 7`) = one week (in ms) */
	userAccessTokenExpiry: 604_800_000,
	/** pls don't change this one */
	userPasswordHashAlgorithm: 'sha256',

	defaultPerson: {
		id: 0,
		name: '',
		displayName: 'No Person',
	},

	contentFileOptimisation: {
		labels: ['optimised-tiny', 'optimised-small', 'optimised-regular'],
		configs: [
			{
				label: 'optimised-tiny',
				longEdge: 250,
				quality: 55,
			},
			{
				label: 'optimised-small',
				longEdge: 800,
				quality: 60,
			},
			{
				label: 'optimised-regular',
				longEdge: 2000,
				quality: 65,
			},
		],
	},

	contentDefaultThumbnails: [
		{
			count: 1,
			label: 'default',
			width: 1280,
		},
	],
} satisfies __CoreParams as __CoreParams);
