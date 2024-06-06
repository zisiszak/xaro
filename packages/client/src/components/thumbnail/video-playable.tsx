import { type ServerAPI } from '@xaro/server';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { type ViewPreferences } from '../../model/context/view-preferences';
import { colour } from '../../styleguide/colour';
import { filterThumbnailSources } from '../../utils/filter-thumbnail-sources';
import { ImageWithLoader } from '../image-with-loader';
import * as S from './basic.styles.js';

export type VideoPlayableThumbnailProps = {
	mediaItem: ServerAPI.GetAboutContent.Success & {
		record: { kind: 'video' };
	};
	viewPreferences: ViewPreferences;
};

export const VideoPlayableThumbnail: React.FC<VideoPlayableThumbnailProps> = ({
	mediaItem,
	viewPreferences,
}) => {
	const { record, files } = mediaItem;
	const { galleryStyle } = viewPreferences;
	const { title, kind, id } = record;
	const [isPlayerActive, setIsPlayerActive] = useState<boolean>(false);

	const thumbnailSources = filterThumbnailSources(record, files, {
		galleryStyle,
	});
	if (thumbnailSources === null) {
		console.error(
			{
				id,
				kind,
			},
			'Media missing preview file(s)',
		);
		return null;
	}

	return (
		<S.Container
			onClick={() => {
				if (isPlayerActive === false) {
					setIsPlayerActive(true);
				}
			}}
			$galleryStyle={galleryStyle}
		>
			{galleryStyle !== 'column' ? (
				<S.BackgroundImage
					style={{ backgroundColor: colour.background.mainMinus }}
				/>
			) : null}
			{isPlayerActive === false ? (
				<>
					<ImageWithLoader {...thumbnailSources} />
					<S.PlayIcon>▶</S.PlayIcon>
				</>
			) : (
				<ReactPlayer
					stopOnUnmount
					playsinline={true}
					playing
					style={{
						position: 'relative',
					}}
					muted
					controls
					height={'100%'}
					width={'100%'}
					loop
					url={
						files.optimisedMedia
							? files.optimisedMedia[0]?.staticPath
							: files.convertedMedia
								? files.convertedMedia[0]?.staticPath
								: files.originalMedia?.staticPath
					}
				/>
			)}
			{title !== null && (
				<S.Title as={'a'} href={`/media?id=${id}`}>
					{title}
				</S.Title>
			)}
		</S.Container>
	);
};
