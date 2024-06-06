import { type ServerAPI } from '@xaro/server';
import { useState } from 'react';
import { Icons } from '../../assets/index.js';
import { type ViewPreferences } from '../../model/context/view-preferences.js';
import { updateMedia } from '../../model/fetch-endpoints/update-media.js';
import { filterThumbnailSources } from '../../utils/filter-thumbnail-sources.js';
import { parseDuration } from '../../utils/parsing-and-sorting/parse-duration.js';
import { Rating } from '../content-item/rating.js';
import * as S from './basic.styles.js';

export interface BasicThumbnailProps {
	viewPreferences: ViewPreferences;
	mediaItem: ServerAPI.GetAboutContent.Success;
	onClick?: () => void;
};

export const BasicThumbnail: React.FC<BasicThumbnailProps> = ({
	mediaItem,
	viewPreferences,
	onClick,
}) => {
	const { record, files, originalContentFile } = mediaItem;
	const { galleryStyle, autoPlayGifs } = viewPreferences;
	const { title, kind, id } = record;

	const [userLibraryData, setUserLibraryData] = useState<Partial<
		NonNullable<typeof mediaItem.userLibraryData>
	> | null>(mediaItem.userLibraryData);
	const [ratingOpen, setRatingOpen] = useState<boolean>(false);

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

	const videoDuration =
		record.kind === 'video'
			? parseDuration(originalContentFile.duration)
			: null;

	const finalSources =
		autoPlayGifs === true &&
		originalContentFile.extension === '.gif' &&
		galleryStyle === 'column'
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

	const updateUserData = (props: ServerAPI.UpdateContent.Body) =>
		updateMedia(id, props)
			.then((res) => {
				if (res.status === 200) {
					return res.json() as Promise<ServerAPI.UpdateContent.Success>;
				}
				return Promise.reject(res.status);
			})
			.then((result) => {
				if (result.updates.userMedia !== null) {
					setUserLibraryData((prev) => ({
						...prev,
						...result.updates.userMedia,
					}));
				}
			})
			.catch((err) => {
				console.error(err);
			});

	return (
		<S.Container
			$galleryStyle={galleryStyle}
			$selectionModeEnabled={false}
			$selected={false}
		>
			<S.ThumbnailImage
				onClick={onClick}
				$galleryStyle={galleryStyle}
				loading="lazy"
				{...finalSources}
				altText={title ?? undefined}
			/>
			{videoDuration !== null && (
				<S.Duration>{videoDuration.toString()}</S.Duration>
			)}
			{kind === 'video' && <S.PlayIcon>▶</S.PlayIcon>}
			{galleryStyle === 'column' && (
				<S.BottomWrap>
					<S.DetailsContainer>
						{title && (
							<S.Title href={`/content?id=${id}`}>
								{title}
							</S.Title>
						)}
					</S.DetailsContainer>
					<S.InteractionsContainer>
						<Rating
							disableInteractions={false}
							isOpen={ratingOpen}
							setOpen={setRatingOpen}
							rating={userLibraryData?.rating ?? null}
							updateRating={(rating) =>
								updateUserData({
									userMedia: {
										rating: rating,
									},
								})
							}
						/>
						<S.FavouriteIcon
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								return updateUserData({
									userMedia: {
										isFavourite:
											userLibraryData?.isFavourite === 1
												? false
												: true,
									},
								});
							}}
							favourite={userLibraryData?.isFavourite}
						>
							<Icons.Favorite />
						</S.FavouriteIcon>
					</S.InteractionsContainer>
				</S.BottomWrap>
			)}
		</S.Container>
	);
};
