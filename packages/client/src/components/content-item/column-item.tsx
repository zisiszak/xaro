import { ServerAPI } from '@xaro/server';
import { useState } from 'react';
import { PartialUserLibraryData } from '.';
import { Icons } from '../../assets';
import { mergeLocationSearchString } from '../../utils/window-location';
import { EditContentDialog } from '../dialogs/edit-content-dialog';
import * as S from './column-item.styles';
import * as I from './interactions-styles';
import { Rating } from './rating';

export interface ColumnContentItemDetailsProps {
	updateContentData: (data: ServerAPI.UpdateContent.Body) => void;
	userLibraryData: PartialUserLibraryData | null;
	contentRecord: ServerAPI.GetAboutContent.Success['record'];
	sortingTags: {
		displayName: string;
		id: number;
	}[];
	disableInteractions: boolean;
}
export const ColumnContentItemDetails: React.FC<
	ColumnContentItemDetailsProps
> = ({
	userLibraryData,
	updateContentData,
	contentRecord: {
		id,
		description,
		title,
		likeCount,
		viewCount,
		commentCount,
		sourceUrl,
	},
	sortingTags,
	disableInteractions,
}) => {
	const [ratingIsOpen, setRatingIsOpen] = useState<boolean>(false);

	return (
		<S.Container>
			<S.PrimaryDetailsContainer>
				{(viewCount !== null ||
					commentCount !== null ||
					sourceUrl !== null ||
					likeCount !== null) && (
					<S.ExternalEngagementMetadata>
						{likeCount !== null && (
							<S.ExternalEngaementTag title="External like count">
								<Icons.Favorite />
								{likeCount}
							</S.ExternalEngaementTag>
						)}
						{viewCount !== null && (
							<S.ExternalEngaementTag title="External view count">
								<Icons.PlayArrow />
								{viewCount}
							</S.ExternalEngaementTag>
						)}
						{commentCount !== null && (
							<S.ExternalEngaementTag title="External comment count">
								<Icons.Edit />
								{commentCount}
							</S.ExternalEngaementTag>
						)}
						{sourceUrl && (
							<S.ExternalEngaementTag
								title="Go to source URL"
								as={'a'}
								href={sourceUrl}
								target="_blank"
								referrerPolicy="no-referrer"
							>
								<Icons.OpenInNew />
							</S.ExternalEngaementTag>
						)}
					</S.ExternalEngagementMetadata>
				)}
				{title && (
					<S.Title
						href={
							disableInteractions
								? undefined
								: `/content?id=${id}`
						}
					>
						{title}
					</S.Title>
				)}
				{sortingTags.length !== 0 && (
					<S.TagsFlex>
						{sortingTags.map(({ displayName, id }) => (
							<S.Tag
								as={'a'}
								href={`?${mergeLocationSearchString({
									sortingTags: [displayName],
								})}`}
								key={id}
							>
								{displayName}
							</S.Tag>
						))}
					</S.TagsFlex>
				)}
				{description && <S.Description>{description}</S.Description>}
			</S.PrimaryDetailsContainer>
			<I.InteractionsContainer>
				<EditContentDialog
					contentId={id}
					updateContentData={updateContentData}
					Trigger={({ onClick }) => (
						<I.OptionsIcon onClick={onClick}>
							<Icons.Settings />
						</I.OptionsIcon>
					)}
				/>
				<Rating
					disableInteractions={disableInteractions}
					isOpen={ratingIsOpen}
					setOpen={setRatingIsOpen}
					rating={userLibraryData?.rating ?? null}
					updateRating={(rating) =>
						updateContentData({
							userMedia: {
								rating: rating,
							},
						})
					}
				/>
				<I.FavouriteIcon
					onClick={(e) => {
						if (!disableInteractions) {
							e.preventDefault();
							e.stopPropagation();
							return updateContentData({
								userMedia: {
									isFavourite:
										userLibraryData?.isFavourite === 1
											? false
											: true,
								},
							});
						}
					}}
					$isFavourite={userLibraryData?.isFavourite}
				>
					<Icons.Favorite />
				</I.FavouriteIcon>
			</I.InteractionsContainer>
		</S.Container>
	);
};
