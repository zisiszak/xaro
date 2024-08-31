import { database } from '~/index.js';
import {
	type TableInsertion,
	type TableSelection,
	type TableUpdate,
} from '~/modules/database.schema.js';
import { insert } from '~/shared/index.js';
import { parseIntBool, toIntBool } from '~/utils/int-bool.js';
import { type UserMediaStatsRecord } from '../models/records.js';
import { UserMediaStatsTable } from '../tables/user-media-stats.table.js';

interface UpdateData {
	seen?: boolean;
	playCount?: number;
	lastPlayhead?: number | null;
	dateLastPlayed?: Date | null;
	isFavourite?: boolean;
	rating?: number;
}
const insertionDataToInsertable = (
	userID: number,
	mediaID: number,
	{
		seen = false,
		playCount = 0,
		lastPlayhead,
		dateLastPlayed,
		isFavourite = false,
		rating,
	}: UpdateData = {},
): TableInsertion<'UserMediaStats'> => ({
	userID,
	mediaID,
	seen: toIntBool(seen),
	playCount,
	lastPlayhead,
	dateLastPlayed:
		dateLastPlayed instanceof Date ? dateLastPlayed.getUTCSeconds() : dateLastPlayed,
	isFavourite: toIntBool(isFavourite),
	rating,
});

const updateDataToUpdateable = ({
	seen,
	playCount,
	lastPlayhead,
	dateLastPlayed,
	isFavourite,
	rating,
}: UpdateData): TableUpdate<'UserMediaStats'> => {
	const result: TableUpdate<'UserMediaStats'> = {};
	if (typeof seen === 'boolean') result.seen = toIntBool(seen);
	if (typeof playCount === 'number') result.playCount = playCount;
	if (typeof lastPlayhead !== 'undefined') result.lastPlayhead = lastPlayhead;
	if (typeof dateLastPlayed !== 'undefined') {
		if (dateLastPlayed === null) result.dateLastPlayed = null;
		else result.dateLastPlayed = dateLastPlayed.getUTCSeconds();
	}
	if (typeof isFavourite === 'boolean') result.isFavourite = toIntBool(isFavourite);
	if (typeof rating !== 'undefined') result.rating = rating;

	return result;
};

const rowToRecord = ({
	userID,
	mediaID,
	seen,
	playCount,
	lastPlayhead,
	dateLastPlayed,
	isFavourite,
	rating,
}: TableSelection<'UserMediaStats'>): UserMediaStatsRecord => ({
	userID,
	mediaID,
	seen: parseIntBool(seen),
	playCount,
	lastPlayhead,
	dateLastPlayed,
	isFavourite: parseIntBool(isFavourite),
	rating,
});

export interface UserMediaStatsRepository {
	/**
	 * Inserts a new `UserMediaStats` row, linking the provided `userID` and `mediaID` with a new stats record.
	 * If there is an existing row, it is updated if the `data` parameter is provided.
	 */
	saveNewOtherwiseUpdateExisting(
		userID: number,
		mediaID: number,
		data?: UpdateData,
	): Promise<void>;

	update(userID: number, mediaID: number, data: UpdateData): Promise<void>;

	/**
	 * Removes the `UserMediaStats` row corresponding to the provided `userID` and `mediaID`, if it exists.
	 */
	remove(userID: number, mediaID: number): Promise<void>;

	exists(userID: number, mediaID: number): Promise<boolean>;

	find(userID: number, mediaID: number): Promise<UserMediaStatsRecord | undefined>;
}

const TABLE = UserMediaStatsTable.name;

export const userMediaStatsRepository: UserMediaStatsRepository = {
	async saveNewOtherwiseUpdateExisting(userID, mediaID, data) {
		const existing = await this.exists(userID, mediaID);
		if (!existing) return insert(TABLE, insertionDataToInsertable(userID, mediaID, data));

		if (!data) return undefined;

		return this.update(userID, mediaID, data);
	},
	async update(userID, mediaID, data) {
		await database
			.updateTable(TABLE)
			.set(updateDataToUpdateable(data))
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst();
	},
	async remove(userID, mediaID) {
		await database
			.deleteFrom(TABLE)
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst();
	},
	async exists(userID, mediaID) {
		return database
			.selectFrom(TABLE)
			.select('mediaID')
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst()
			.then(Boolean);
	},
	async find(userID, mediaID) {
		return database
			.selectFrom(TABLE)
			.selectAll()
			.where((eb) => eb.and({ userID, mediaID }))
			.limit(1)
			.executeTakeFirst()
			.then((selection) =>
				typeof selection === 'undefined' ? undefined : rowToRecord(selection),
			);
	},
};
