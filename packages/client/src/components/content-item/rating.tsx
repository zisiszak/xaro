import { memo, useEffect, useRef, useState, type MouseEvent } from 'react';
import * as S from './rating.styles';

const rating: React.FC<{
	rating: 1 | 2 | 3 | 4 | 5 | null;
	isOpen: boolean;
	setOpen: (bool: boolean | ((prev: boolean) => boolean)) => void;
	updateRating: (number: 1 | 2 | 3 | 4 | 5 | null) => void;
	disableInteractions: boolean;
}> = ({
	rating: fetchedRating,
	updateRating,
	isOpen: open,
	setOpen,
	disableInteractions,
}) => {
	const selectionContainerRef = useRef<HTMLDivElement>(null);
	const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(
		fetchedRating,
	);

	useEffect(() => {
		if (
			open === false ||
			selectionContainerRef.current === null ||
			disableInteractions
		) {
			return;
		}

		const handleClick = (e: WindowEventMap['click']) => {
			if (disableInteractions) {
				setOpen(false);
				return;
			}

			if (
				!selectionContainerRef.current ||
				e.target !== selectionContainerRef.current
			) {
				if (open === true) {
					setOpen(false);
					return;
				}
			}
		};
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, [open]);

	const handleRatingChange = (v: 1 | 2 | 3 | 4 | 5 | null) => {
		if (disableInteractions) {
			return;
		}
		return (e: MouseEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			if (rating === v) {
				return;
			}
			setRating(v);
			updateRating(v);
		};
	};

	const openRatingGrid = disableInteractions
		? undefined
		: (e: MouseEvent<HTMLDivElement>) => {
				e.preventDefault();
				e.stopPropagation();
				setOpen((prev) => !prev);
			};

	return (
		<S.Container $isOpen={open}>
			<S.RatingStarGrid
				$starCount={rating ?? 1}
				$isCurrent={rating !== null}
				$isRatingIcon
				onClick={openRatingGrid}
			>
				{rating === null ? (
					<S.NullStar>★</S.NullStar>
				) : (
					Array(rating ?? 1)
						.fill(undefined)
						.map((_, i) => (
							<S.RatingStar
								key={i}
								$starIndex={(i + 1) as 1 | 2 | 3 | 4 | 5}
							>
								★
							</S.RatingStar>
						))
				)}
			</S.RatingStarGrid>
			{open && !disableInteractions && (
				<S.SelectionContainer ref={selectionContainerRef}>
					{([1, 2, 3, 4, 5] as const).map((r, k) => (
						<S.RatingStarGrid
							key={k}
							onClick={handleRatingChange(
								r === rating ? null : r,
							)}
							$starCount={r}
							$isCurrent={r === rating}
						>
							{Array(r)
								.fill(null)
								.map((_, i) => (
									<S.RatingStar
										key={i}
										$starIndex={
											(i + 1) as 1 | 2 | 3 | 4 | 5
										}
									>
										★
									</S.RatingStar>
								))}
						</S.RatingStarGrid>
					))}
				</S.SelectionContainer>
			)}
		</S.Container>
	);
};

export const Rating = memo(
	rating,
	(prev, next) => prev.isOpen === next.isOpen && prev.rating === next.rating,
);
