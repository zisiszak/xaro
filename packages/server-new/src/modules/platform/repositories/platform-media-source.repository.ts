import { xaro } from '~/index.js';
import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { findByID, insert } from '~/shared/index.js';

type PlatformMediaSourceSelection = TableSelection<'PlatformMediaSource'>;
type PlatformMediaSourceInsertion = TableInsertion<'PlatformMediaSource'>;

export interface PlatformMediaSourceRepository {
	findByID(platformMediaSourceID: number): Promise<PlatformMediaSourceSelection | undefined>;
	findBySourceID(
		platformID: number,
		sourceID: string,
	): Promise<PlatformMediaSourceSelection | undefined>;
	insert(platformMediaSource: PlatformMediaSourceInsertion): Promise<number>;
}

export const platformMediaSourceRepository: PlatformMediaSourceRepository = {
	async findByID(platformMediaSourceID) {
		return findByID('PlatformMediaSource', platformMediaSourceID);
	},
	async findBySourceID(platformID: number, sourceId: string) {
		return xaro.db
			.selectFrom('PlatformMediaSource')
			.selectAll()
			.where((eb) => eb.and({ platformID, sourceId }))
			.executeTakeFirst();
	},
	async insert(platformMediaSource) {
		return insert('PlatformMediaSource', platformMediaSource);
	},
};
