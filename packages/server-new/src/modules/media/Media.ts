import { logger } from '~/index.js';
import { platformMediaSourceRepository } from '~/modules/platform/index.js';
import {
	type FileToMediaRelationship,
	FileToMediaRelationshipEnum,
} from '../file-to-media/model.js';
import { userToMediaRepository } from '../user-to-media/sqlite.repository.js';
import { type FullMediaRecord, type MediaFilesRecord, type MediaSourceRecord } from './model.js';
import { mediaRepository } from './sqlite.repository.js';

const fileRelationshipToMediaRecordKeyMap: Record<FileToMediaRelationship, keyof MediaFilesRecord> =
	{
		[FileToMediaRelationshipEnum.Media]: 'media',
		[FileToMediaRelationshipEnum.VideoPreview]: 'videoPreview',
		[FileToMediaRelationshipEnum.Thumbnail]: 'thumbnail',
		[FileToMediaRelationshipEnum.Subtitles]: 'subtitles',
		[FileToMediaRelationshipEnum.Metadata]: 'metadata',
		[FileToMediaRelationshipEnum.Dump]: 'dump',
	};

export class Media {
	readonly #mediaID: number;
	get mediaID() {
		return this.#mediaID;
	}

	#platformMediaSourceID: number | null;
	get platformMediaSourceID() {
		return this.#platformMediaSourceID;
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	#metadata: {} | null;
	get metadata() {
		return this.#metadata;
	}

	#dateAdded: number;
	get dateAdded() {
		return this.#dateAdded;
	}

	#dateTrashed: number | null;
	get dateTrashed() {
		return this.#dateTrashed;
	}

	private constructor(data: {
		id: number;
		platformMediaSourceID: number | null;
		dateAdded: number;
		dateTrashed: number | null;
		// eslint-disable-next-line @typescript-eslint/ban-types
		metadata: {};
	}) {
		this.#mediaID = data.id;
		this.#platformMediaSourceID = data.platformMediaSourceID;
		this.#dateAdded = data.dateAdded;
		this.#metadata = data.metadata;
		this.#dateTrashed = data.dateTrashed;
	}

	static async getMediaFilesRecord(mediaID: number, userID?: number): Promise<MediaFilesRecord> {
		const files = await mediaRepository.getAllLinkedFiles(mediaID, {
			linkedUserID: userID,
		});
		const record: MediaFilesRecord = {};

		files.forEach((file) => {
			const key = fileRelationshipToMediaRecordKeyMap[file.mediaRelationship];
			record[key] ??= [];
			record[key].push(file);
		});

		return record;
	}

	static async getAboutMedia(
		mediaID: number,
		userID?: number,
	): Promise<FullMediaRecord | undefined> {
		const media = await mediaRepository.findByID(mediaID);
		if (!media) return undefined;

		const tags = await mediaRepository.getAllLinkedSortingTagNames(mediaID);
		const files = await this.getMediaFilesRecord(mediaID, userID);

		let source: MediaSourceRecord;
		if (typeof media.platformMediaSourceID === 'number') {
			const platformSource = await platformMediaSourceRepository.findByID(
				media.platformMediaSourceID,
			);
			if (!platformSource) throw 'platform media source missing';

			source = platformSource;
		} else {
			source = {};
		}

		const record: FullMediaRecord = { ...media, files, sorting: { tags }, source };
		return record;
	}

	/** returns the newly created media id */
	static async create(data?: { platformMediaSourceID?: number | null }): Promise<number> {
		const mediaID = await mediaRepository.save({
			platformMediaSourceID: data?.platformMediaSourceID ?? null,
		});

		logger.info({ mediaID }, 'Media reference created.');

		return mediaID;
	}

	static async linkToUser(mediaID: number, userID: number): Promise<void> {
		await userToMediaRepository.save(userID, mediaID);
	}

	static async fromMediaID(mediaID: number): Promise<Media> {
		const media = await mediaRepository.findByID(mediaID);
		if (!media) throw 'Media id not found.';

		return new Media(media);
	}
}
