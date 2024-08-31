import { database } from '~/index.js';
import { type TableInsertion, type TableSelection } from '~/modules/database.schema.js';
import { type FileFormatCategory } from '~/modules/files/index.js';
import {
	type InValueFilter,
	type NotInValueFilter,
} from '~/shared/database/types.value-filters.js';
import { findByID, insert } from '~/shared/index.js';
import { type FileToMediaRelationship } from '../models/constants.js';

type MediaSelection = TableSelection<'Media'>;
type MediaInsertion = TableInsertion<'Media'>;

export interface MediaRepository {
	findByID(mediaID: number): Promise<MediaSelection | undefined>;
	save(media: MediaInsertion): Promise<number>;
	remove(mediaID: number): Promise<undefined>;

	/** Gets all files linked to the content */
	getAllLinkedFiles(
		mediaID: number,
		options?: {
			linkedUserID?: number;
			relationship?: InValueFilter<FileToMediaRelationship> &
				NotInValueFilter<FileToMediaRelationship>;
			fileFormatID?: InValueFilter<number> & NotInValueFilter<number>;
			fileFormatCategory?: InValueFilter<FileFormatCategory> &
				NotInValueFilter<FileFormatCategory>;
			orderBy?: 'size asc' | 'size desc';
		},
	): Promise<
		(TableSelection<'File'> & {
			mediaID: number;
			mediaRelationship: FileToMediaRelationship;
		})[]
	>;

	getAllLinkedSortingTagNames(mediaID: number): Promise<string[]>;
	linkSortingTag(mediaID: number, sortingTagID: number): Promise<undefined>;
	unlinkSortingTag(mediaID: number, sortingTagID: number): Promise<undefined>;
}

export const mediaRepository: MediaRepository = {
	async findByID(mediaID) {
		return findByID('Media', mediaID);
	},
	async save(media) {
		return insert('Media', media);
	},
	async remove(mediaID) {
		return database
			.deleteFrom('Media')
			.where('id', '=', mediaID)
			.executeTakeFirst()
			.then(() => undefined);
	},

	async getAllLinkedFiles(
		mediaID,
		{ linkedUserID, relationship, fileFormatID, fileFormatCategory, orderBy = 'size asc' } = {},
	) {
		let query = database
			.selectFrom('File')
			.selectAll()
			.leftJoin('FileToMedia', 'File.originalFileID', 'FileToMedia.fileID')
			.leftJoin('FileToMedia', 'File.id', 'FileToMedia.fileID')
			.select([
				'FileToMedia.mediaID as mediaID',
				'FileToMedia.relationship as mediaRelationship',
			])
			.where('FileToMedia.mediaID', '=', mediaID);

		if (typeof linkedUserID === 'number') {
			query = query
				.innerJoin('UserToFile', 'File.id', 'UserToFile.fileID')
				.select('UserToFile.fileID as id')
				.where('UserToFile.userID', '=', linkedUserID);
		}

		if (!!relationship && (!!relationship.in || !!relationship.notIn)) {
			const operator = relationship.in ? ('in' as const) : ('not in' as const);
			const array = relationship.in ? relationship.in : relationship.notIn!;
			query = query.where('FileToMedia.relationship', operator, array);
		}

		const fileFormatIDCondition = !!fileFormatID && (!!fileFormatID.in || !!fileFormatID.notIn);
		const fileFormatCategoryCondition =
			!!fileFormatCategory && (!!fileFormatCategory.in || fileFormatCategory.notIn);
		if (fileFormatIDCondition || fileFormatCategoryCondition) {
			let q = query
				.innerJoin('FileFormat', 'File.formatID', 'FileFormat.id')
				.select('FileFormat.id as formatID');
			if (fileFormatIDCondition) {
				const operator = fileFormatID.in ? ('in' as const) : ('not in' as const);
				const array = fileFormatID.in ? fileFormatID.in : fileFormatID.notIn!;
				q = q.where('FileFormat.id', operator, array);
			}
			if (fileFormatCategoryCondition) {
				const operator = fileFormatCategory.in ? ('in' as const) : ('not in' as const);
				const array = fileFormatCategory.in
					? fileFormatCategory.in
					: fileFormatCategory.notIn!;
				q = q.where('FileFormat.category', operator, array);
			}
			query = q;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return query.orderBy(`File.${orderBy}`).execute() as Promise<any>;
	},
	async getAllLinkedSortingTagNames(mediaID) {
		return database
			.selectFrom('SortingTag')
			.select('name')
			.innerJoin('MediaToSortingTag', 'MediaToSortingTag.sortingTagID', 'SortingTag.id')
			.where('MediaToSortingTag.mediaID', '=', mediaID)
			.execute()
			.then((result) => result.map(({ name }) => name));
	},
	async linkSortingTag(mediaID, sortingTagID) {
		return database
			.insertInto('MediaToSortingTag')
			.values({ mediaID, sortingTagID })
			.onConflict((cb) => cb.doNothing())
			.executeTakeFirst()
			.then(() => undefined);
	},
	async unlinkSortingTag(mediaID, sortingTagID) {
		return database
			.deleteFrom('MediaToSortingTag')
			.where((eb) => eb.and({ mediaID, sortingTagID }))
			.execute()
			.then(() => undefined);
	},
};
