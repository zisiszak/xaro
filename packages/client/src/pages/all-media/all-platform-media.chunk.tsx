import { type ServerAPI } from '@xaro/server';
import { memo } from 'react';
import { ContentGalleryItem } from '../../components/content-item';

const mediaItemsChunk: React.FC<{
	items: ServerAPI.GetAboutContent.Success[];
	selections: number[];
	onImageClick: (absoluteIndex: number) => void;
	selectionModeEnabled: boolean;
	chunkIndexOffset: number;
}> = ({
	items,
	selectionModeEnabled,
	selections,
	chunkIndexOffset,
	onImageClick,
}) =>
	items.map((item, j) => {
		const absoluteIndex = chunkIndexOffset + j;

		return (
			<ContentGalleryItem
				key={absoluteIndex}
				mediaItem={item}
				contentIndex={absoluteIndex}
				selected={selections.includes(item.record.id)}
				selectionModeEnabled={selectionModeEnabled}
				onImageClick={onImageClick}
			/>
		);
	});

export const MediaItemsChunk = memo(
	mediaItemsChunk,
	(prev, next) =>
		prev.selectionModeEnabled === next.selectionModeEnabled &&
		prev.items.length === next.items.length &&
		prev.chunkIndexOffset === next.chunkIndexOffset &&
		JSON.stringify(prev.selections) === JSON.stringify(next.selections),
);
