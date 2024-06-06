import { ServerAPI } from '@xaro/server';
import { memo, useState } from 'react';
import { useViewPreferences } from '../../model/context/view-preferences';
import { updateMedia } from '../../model/fetch-endpoints/update-media';
import { filterThumbnailSources } from '../../utils/filter-thumbnail-sources';
import { parseDuration } from '../../utils/parsing-and-sorting/parse-duration';
import * as S from '../thumbnail/basic.styles';
import { ColumnContentItemDetails } from './column-item';
import { ListContentItemDetails } from './list-item';

export type PartialUserLibraryData = Partial<
	NonNullable<ServerAPI.GetAboutContent.Success['userLibraryData']>
>;

const updateMediaItemData = async (
	contentId: number,
	props: ServerAPI.UpdateContent.Body,
	setMediaItemData: React.Dispatch<
		React.SetStateAction<ServerAPI.GetAboutContent.Success>
	>,
) =>
	updateMedia(contentId, props)
		.then((res) => {
			if (res.status === 200) {
				return res.json() as Promise<ServerAPI.UpdateContent.Success>;
			}
			return Promise.reject(res.status);
		})
		.then((result) => {
			if (
				result.updates.userMedia !== null ||
				result.updates.sorting.tags !== null
			) {
				setMediaItemData((prev) => ({
					...prev,
					sorting: {
						tags: result.updates.sorting.tags ?? prev.sorting.tags,
					},
					userLibraryData: {
						...prev.userLibraryData,
						...(result.updates.userMedia as any),
					},
				}));
			}
		});

export interface ContentGalleryItemProps {
	mediaItem: ServerAPI.GetAboutContent.Success;
	onImageClick: (contentIndex: number) => void;
	selectionModeEnabled: boolean;
	selected: boolean;
	contentIndex: number;
}

const contentGalleryItem: React.FC<ContentGalleryItemProps> = ({
	mediaItem,
	selected,
	onImageClick,
	selectionModeEnabled,
	contentIndex,
}) => {
	const {
		viewPreferences: { galleryStyle: galleryStyle },
	} = useViewPreferences();
	// const [isSelected, setIsSelected] = useState<boolean>(selected);
	const [mediaItemState, setMediaItemState] =
		useState<typeof mediaItem>(mediaItem);

	const { record, files, originalContentFile } = mediaItem;
	const { title, kind, id } = record;

	const thumbnailSources = filterThumbnailSources(record, files, {
		galleryStyle,
	});
	if (thumbnailSources === null) {
		console.error(`Content id ${id} missing thumb file(s).`);
		return null;
	}

	const finalSources =
		originalContentFile.extension === '.gif' && galleryStyle === 'column'
			? {
					preloadableImageSrc: thumbnailSources.preloadableImageSrc,
					mainImageSrc:
						files.original ??
						(files.optimised
							? files.optimised[0]
							: files.converted
								? files.converted[0]
								: files.resized
									? files.resized[0]
									: null)!,
				}
			: thumbnailSources;

	const duration =
		record.kind === 'video'
			? parseDuration(originalContentFile.duration)
			: null;

	return (
		<S.Container
			$galleryStyle={galleryStyle}
			$selected={selected}
			$selectionModeEnabled={selectionModeEnabled}
		>
			<S.ThumbnailContainer
				$selected={selected}
				$galleryStyle={galleryStyle}
			>
				<S.ThumbnailImage
					$selected={selected}
					onClick={
						selectionModeEnabled
							? undefined
							: () => {
									onImageClick(contentIndex);
								}
					}
					$galleryStyle={galleryStyle}
					loading="lazy"
					{...finalSources}
					altText={title ?? undefined}
				/>
				{kind === 'video' && duration !== null && (
					<S.Duration>{duration.toString()}</S.Duration>
				)}
			</S.ThumbnailContainer>
			{galleryStyle === 'column' && (
				<ColumnContentItemDetails
					disableInteractions={selectionModeEnabled}
					contentRecord={record}
					sortingTags={mediaItemState.sorting.tags}
					userLibraryData={mediaItemState?.userLibraryData}
					updateContentData={(data) =>
						updateMediaItemData(id, data, setMediaItemState)
					}
				/>
			)}
			{galleryStyle === 'list' && (
				<ListContentItemDetails
					disableInteractions={selectionModeEnabled}
					contentId={id}
					titleFallback={
						originalContentFile.originalFilename ?? id.toString()
					}
					duration={duration}
					description={record.description}
					userLibraryData={mediaItemState.userLibraryData}
					updateUserLibraryData={(data) =>
						updateMediaItemData(id, data, setMediaItemState)
					}
					title={title}
					kind={kind}
					extension={originalContentFile.extension}
				/>
			)}
			{selectionModeEnabled && selected && (
				<S.SelectionToggle>✓</S.SelectionToggle>
			)}
		</S.Container>
	);
};

export const ContentGalleryItem = memo(
	contentGalleryItem,
	(prev, next) =>
		(prev.selectionModeEnabled === next.selectionModeEnabled
			? prev.selected === next.selected
			: false) &&
		prev.mediaItem.record.id === next.mediaItem.record.id &&
		prev.contentIndex === next.contentIndex,
);
