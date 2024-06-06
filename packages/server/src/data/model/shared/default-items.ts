import { __coreParams } from '~/config/core-params.js';
import { type AddPlatformProfileIfNotExistsProps } from '../../access/platform-profile.js';

export const defaultPlatformProfileInsertion: Omit<
	AddPlatformProfileIfNotExistsProps,
	'linkedPlatformId'
> = {
	linkedPersonId: __coreParams.defaultPerson.id,
	assets: {},
	name: 'default',
	displayName: 'default',
	sourceId: '',
	sourceUrl: '',
	description: 'For when all else fails.',
};
