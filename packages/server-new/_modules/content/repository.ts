import { type Generated, type Insertable, type JSONColumnType, type Selectable } from 'kysely';
import { xaro } from '~/index.js';
import { type DateAddedColumn } from '~/utils/types.js';
import { type PlatformContentMetadata } from '../platform/index.js';
import { type ContentDto, type InsertableContentDto } from './model.js';

export interface Table {
	id: Generated<number>;
	metadata: JSONColumnType<PlatformContentMetadata, string | undefined>;
	platform_id: number | null;
	platform_community_id: number | null;
	platform_sourceid: string | null;
	platform_source_url: string | null;
	date_added: DateAddedColumn;
}

type Selection = Selectable<Table>;
type Insertion = Insertable<Table>;
// type Update = Updateable<Table>;

export const findByID = async (id: number) =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then(selectionRowToDto);

export async function insert(insertionDto: InsertableContentDto): Promise<number> {
	return xaro.db
		.insertInto(TABLE_NAME)
		.values(insertableDtoToInsertionRow(insertionDto))
		.executeTakeFirstOrThrow()
		.then((result) => Number(result.insertId));
}

export const removeByID = async (id: number): Promise<0 | 1> =>
	xaro.db
		.deleteFrom(TABLE_NAME)
		.where('id', '=', id)
		.executeTakeFirst()
		.then((result) => Number(result.numDeletedRows) as 0 | 1);

export const checkIfPlatformContentExists = (
	platformID: number,
	sourceIdOrUrl: { kind: 'id' | 'url'; value: string },
): Promise<boolean> =>
	xaro.db
		.selectFrom(TABLE_NAME)
		.select('id')
		.where((eb) =>
			eb.and([
				eb('platform_id', '=', platformID),
				eb(
					sourceIdOrUrl.kind === 'id' ? 'platform_sourceid' : 'platform_source_url',
					'=',
					sourceIdOrUrl.value,
				),
			]),
		)
		.executeTakeFirst()
		.then(Boolean);

function selectionRowToDto(row?: undefined): undefined;
function selectionRowToDto(row: Selection): ContentDto;
function selectionRowToDto(row?: Selection | undefined): ContentDto | undefined;
function selectionRowToDto(row?: Selection | undefined): ContentDto | undefined {
	if (typeof row === 'undefined') return undefined;
	return {
		id: row.id,
		metadata: row.metadata,
		platformID: row.platform_id,
		platformCommunityID: row.platform_community_id,
		platformSourceId: row.platform_sourceid,
		platformSourceUrl: row.platform_source_url,
		dateAdded: new Date(row.date_added),
	};
}

function insertableDtoToInsertionRow({
	platformCommunityID: platform_community_id,
	platformID: platform_id,
	metadata,
	platformSourceId: platform_sourceid,
	platformSourceUrl: platform_source_url,
}: InsertableContentDto): Insertion {
	return {
		metadata: metadata ? JSON.stringify(metadata) : undefined,
		platform_community_id,
		platform_id,
		platform_source_url,
		platform_sourceid,
	};
}
