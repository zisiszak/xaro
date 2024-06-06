import { MediaExtension, ServerAPI } from '@xaro/server';
import { useState } from 'react';
import { PartialUserLibraryData } from '.';
import { Icons } from '../../assets';
import { Duration } from '../../utils/parsing-and-sorting/parse-duration';
import * as I from './interactions-styles';
import * as S from './list-item.styles';
import { Rating } from './rating';

export interface ListContentItemDetailsProps {
	userLibraryData: PartialUserLibraryData | null;
	updateUserLibraryData: (data: ServerAPI.UpdateContent.Body) => void;
	title: string | null;
	titleFallback: string;
	description: string | null;
	kind: 'video' | 'image';
	extension: MediaExtension;
	duration: Duration | null;
	contentId: number;
	disableInteractions: boolean;
}
export const ListContentItemDetails: React.FC<ListContentItemDetailsProps> = ({
	title,
	contentId,
	userLibraryData,
	updateUserLibraryData,
	description,
	titleFallback,
	extension,
	disableInteractions,
}) => {
	const [ratingIsOpen, setRatingIsOpen] = useState<boolean>(false);
	return (
		<S.Container href={`/content?id=${contentId}`}>
			<S.PrimaryDetailsContainer>
				<S.ExtensionTag>{extension}</S.ExtensionTag>
				{<S.Title>{title ?? titleFallback}</S.Title>}
				{description && <S.Description>{description}</S.Description>}
			</S.PrimaryDetailsContainer>
			<I.InteractionsContainer>
				<Rating
					disableInteractions={disableInteractions}
					isOpen={ratingIsOpen}
					setOpen={setRatingIsOpen}
					rating={userLibraryData?.rating ?? null}
					updateRating={(rating) =>
						updateUserLibraryData({
							userMedia: {
								rating: rating,
							},
						})
					}
				/>
				<I.FavouriteIcon
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						return updateUserLibraryData({
							userMedia: {
								isFavourite:
									userLibraryData?.isFavourite === 1
										? false
										: true,
							},
						});
					}}
					$isFavourite={userLibraryData?.isFavourite}
				>
					<Icons.Favorite />
				</I.FavouriteIcon>
			</I.InteractionsContainer>
		</S.Container>
	);
};
