import { ServerAPI } from '@xaro/server';
import {
	PropsWithChildren,
	forwardRef,
	useEffect,
	useRef,
	useState,
} from 'react';
import styled from 'styled-components';
import { GalleryStyle } from '../../model/context/view-preferences';
import { factor } from '../../styleguide/factor';
import { mediaQuery } from '../../styleguide/media-query';
import { useForwardedRef } from '../../utils/hooks/use-forwarded-ref';
import { MediaItemsChunk } from './all-platform-media.chunk';

const GallerySection = styled.section`
	font-size: ${factor.LG(1)};
	padding: 2em 0.25em;
	overflow: hidden;
`;

const SmallSquareGrid = styled.div`
	display: grid;
	gap: 0.25em;
	font-size: ${factor.SM(0.875)};
	grid-template-columns: repeat(4, 1fr);
	${mediaQuery.minWidth.MD} {
		grid-template-columns: repeat(5, 1fr);
	}
	${mediaQuery.minWidth.LG} {
		grid-template-columns: repeat(8, 1fr);
	}
	${mediaQuery.minWidth.XL} {
		grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
	}
`;
const MediumSquareGrid = styled.div`
	display: grid;
	font-size: ${factor.MD(1)};
	gap: 0.25em;
	grid-template-columns: repeat(3, 1fr);
	${mediaQuery.minWidth.MD} {
		grid-template-columns: repeat(5, 1fr);
	}
	${mediaQuery.minWidth.LG} {
		grid-template-columns: repeat(7, 1fr);
	}
	${mediaQuery.minWidth.XL} {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
`;
const LargeSquareGrid = styled.div`
	display: grid;
	gap: 0.25em;
	font-size: ${factor.LG(1)};
	grid-template-columns: repeat(2, 1fr);
	${mediaQuery.minWidth.MD} {
		grid-template-columns: repeat(3, 1fr);
	}
	${mediaQuery.minWidth.LG} {
		grid-template-columns: repeat(4, 1fr);
	}
	${mediaQuery.minWidth.XL} {
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	}
`;
const SquareGridMap = {
	'square-grid-sm': SmallSquareGrid,
	'square-grid-md': MediumSquareGrid,
	'square-grid-lg': LargeSquareGrid,
};

const ColumnContainer = styled.div`
	margin: 0 auto;
	max-width: 48rem;
	width: 100%;
`;
const ColumnGrid = styled.div`
	display: grid;
	gap: 3em;
`;

const ListContainer = styled.div`
	margin: 0 auto;
	max-width: 64rem;
	width: 100%;
`;
const ListGrid = styled.div`
	display: grid;
	margin: 0 auto;
	max-width: 80rem;
	width: 100%;
	font-size: ${factor.LG(1)};
	gap: 1.5em;
`;

const SquareGridGallery = forwardRef<
	HTMLDivElement,
	PropsWithChildren & {
		style: 'square-grid-sm' | 'square-grid-md' | 'square-grid-lg';
	}
>(({ children, style }, ref) => {
	const Grid = SquareGridMap[style];
	return (
		<GallerySection>
			<Grid ref={ref}>{children}</Grid>
		</GallerySection>
	);
});

const ColumnGallery = forwardRef<
	HTMLDivElement,
	PropsWithChildren & { style: 'column' }
>(({ children }, ref) => (
	<GallerySection>
		<ColumnContainer>
			<ColumnGrid ref={ref}>{children}</ColumnGrid>
		</ColumnContainer>
	</GallerySection>
));

const ListGallery = forwardRef<
	HTMLDivElement,
	PropsWithChildren & { style: 'list' }
>(({ children }, ref) => (
	<GallerySection>
		<ListContainer>
			<ListGrid ref={ref}>{children}</ListGrid>
		</ListContainer>
	</GallerySection>
));

const GalleryMap = {
	'square-grid-sm': SquareGridGallery,
	'square-grid-md': SquareGridGallery,
	'square-grid-lg': SquareGridGallery,
	column: ColumnGallery,
	list: ListGallery,
};

export const Gallery = forwardRef<
	HTMLDivElement,
	{
		mediaChunks: ServerAPI.GetAllContent.Success[];
		itemsPerChunk: number;
		selectionModeEnabled: boolean;
		style: GalleryStyle;
		onImageClick: (absoluteIndex: number) => void;
	}
>(
	(
		{
			onImageClick,
			mediaChunks,
			style,
			itemsPerChunk,
			selectionModeEnabled,
		},
		ref,
	) => {
		const [selections, setSelections] = useState<number[]>([]);
		const selectionsSet = useRef<Set<number>>(new Set());

		const containerRef = useForwardedRef(ref);
		const initialPointerDown = useRef<[number, number] | null>(null);
		const scrollAction = useRef<boolean>(false);
		const selectionRange = useRef<[number, number] | null>(null);
		const selectionRangeMode = useRef<'add' | 'remove'>('add');
		const pointerId = useRef<number | null>(null);
		const selectionRangeIndexDiff = useRef<Set<number>>(new Set());

		const updateSelections = () => {
			setSelections(Array.from(selectionsSet.current));
		};
		const addSelection = (contentId: number) => {
			selectionsSet.current.add(contentId);
			updateSelections();
		};
		const removeSelection = (contentId: number) => {
			selectionsSet.current.delete(contentId);
			updateSelections();
		};

		const resolveContentChunkAndRelativeIndex = (contentIndex: number) => {
			const chunk = Math.ceil((contentIndex + 1) / itemsPerChunk) - 1;
			const relativeIndex = contentIndex % itemsPerChunk;
			return { chunk, relativeIndex };
		};

		const updateSelectionSetFromRange = (
			mode: 'add' | 'remove',
			startIndex: number,
			endIndex: number,
		) => {
			if (endIndex < startIndex) {
				throw new Error('Start index cannot be larger than end index!');
			}
			for (let index = startIndex; index <= endIndex; index++) {
				if (
					mode !== selectionRangeMode.current &&
					!selectionRangeIndexDiff.current.has(index)
				) {
					return;
				}

				const { chunk, relativeIndex } =
					resolveContentChunkAndRelativeIndex(index);
				const contentId =
					mediaChunks[chunk]?.results[relativeIndex]?.record.id;
				if (typeof contentId === 'undefined') {
					continue;
				}

				const isSelected = selectionsSet.current.has(contentId);

				if (mode === 'add' && !isSelected) {
					selectionsSet.current.add(contentId);
					selectionRangeIndexDiff.current.add(index);
				} else if (mode === 'remove' && isSelected) {
					selectionsSet.current.delete(contentId);
					selectionRangeIndexDiff.current.add(index);
				}
			}
		};

		useEffect(() => {
			// Do this to limit rerenders. Only done when selection mode is disabled, ensuring the next time it's re-enabled, there's no flickering of previous state
			if (!selectionModeEnabled) {
				selectionsSet.current = new Set();
				updateSelections();
			}

			const getContentFromCoordinates = (
				clientX: number,
				clientY: number,
			) => {
				const container = containerRef.current;
				if (!container) {
					console.error('NO CONTAINER');
					return null;
				}

				const listOfElementsUnderPointer = document.elementsFromPoint(
					clientX,
					clientY,
				);
				const indexOfContainerElementInList =
					listOfElementsUnderPointer.findIndex(
						(el) => el === container,
					);
				if (
					indexOfContainerElementInList === -1 ||
					indexOfContainerElementInList === 0
				) {
					if (indexOfContainerElementInList === -1) {
						console.error('CONTAINER ELEMENT NOT FOUND');
					}
					return null;
				}

				const contentElement =
					listOfElementsUnderPointer[
						indexOfContainerElementInList - 1
					];
				if (
					!contentElement ||
					!('contentid' in contentElement.attributes) ||
					!('contentindex' in contentElement.attributes)
				) {
					console.error('CONTENT ELEMENT NOT FOUND');
					return null;
				}

				const id = parseInt(
					(contentElement.attributes.contentid as any).value,
				);
				const index = parseInt(
					(contentElement.attributes.contentindex as any).value,
				);

				return {
					id,
					index,
				};
			};

			if (containerRef.current && selectionModeEnabled) {
				const endPointerInteraction = () => {
					if (containerRef.current) {
						containerRef.current.onpointermove = null;
						containerRef.current.style.touchAction = 'unset';
						pointerId.current !== null &&
							containerRef.current.releasePointerCapture(
								pointerId.current,
							);
					}

					pointerId.current = null;
					if (initialPointerDown.current && !scrollAction.current) {
						const [initialX, initialY] = initialPointerDown.current;
						const content = getContentFromCoordinates(
							initialX,
							initialY,
						);
						if (content) {
							if (selectionsSet.current.has(content.id)) {
								removeSelection(content.id);
							} else {
								addSelection(content.id);
							}
						}
					}
					scrollAction.current = false;
					selectionRangeIndexDiff.current.clear();
					selectionRange.current = null;
					initialPointerDown.current = null;
				};

				const onPointerMove = (e: PointerEvent) => {
					if (!containerRef.current) {
						return;
					}

					const { clientX, clientY } = e;
					if (!selectionRange.current) {
						if (initialPointerDown.current === null) {
							console.error(
								'No initial pointer down coordinates!',
							);
							return;
						}

						// release capture if movement is considered vertical
						const [initialX, initialY] = initialPointerDown.current;
						const i = clientX - initialX;
						const j = clientY - initialY;
						const theta = Math.abs(Math.atan2(j, i));
						if (theta > Math.PI / 4 && theta < (3 * Math.PI) / 4) {
							scrollAction.current = true;
							endPointerInteraction();
							return;
						}

						scrollAction.current = true;
						const content = getContentFromCoordinates(
							clientX,
							clientY,
						);
						if (!content) {
							console.error(
								'No content found on initial pointer move',
							);
							endPointerInteraction();
							return;
						}

						if (selectionsSet.current.has(content.id)) {
							selectionRangeMode.current = 'remove';
							removeSelection(content.id);
						} else {
							selectionRangeMode.current = 'add';
							addSelection(content.id);
						}
						selectionRange.current = [content.index, content.index];
						return;
					}

					const content = getContentFromCoordinates(clientX, clientY);
					if (!content) {
						return;
					}
					const { index: currentIndex } = content;
					const [firstIndex, previousIndex] = selectionRange.current;
					if (
						currentIndex === previousIndex
						// currentIndex === firstIndex
					) {
						return;
					}

					if (firstIndex < currentIndex) {
						// previous < first < current
						if (previousIndex < firstIndex) {
							updateSelectionSetFromRange(
								selectionRangeMode.current === 'add'
									? 'remove'
									: 'add',
								previousIndex,
								firstIndex - 1,
							);
							updateSelectionSetFromRange(
								selectionRangeMode.current,
								firstIndex,
								currentIndex,
							);
						}
						// first < previous < current
						else if (previousIndex < currentIndex) {
							updateSelectionSetFromRange(
								selectionRangeMode.current,
								previousIndex,
								currentIndex,
							);
						}
						// first < current < previous
						else {
							updateSelectionSetFromRange(
								selectionRangeMode.current === 'add'
									? 'remove'
									: 'add',
								currentIndex + 1,
								previousIndex,
							);
						}
					} else {
						// previous < current < first
						if (currentIndex > previousIndex) {
							updateSelectionSetFromRange(
								selectionRangeMode.current === 'add'
									? 'remove'
									: 'add',
								previousIndex,
								currentIndex - 1,
							);
							// current < first < previous
						} else if (firstIndex < previousIndex) {
							updateSelectionSetFromRange(
								selectionRangeMode.current === 'add'
									? 'remove'
									: 'add',
								firstIndex + 1,
								previousIndex,
							);
							updateSelectionSetFromRange(
								selectionRangeMode.current,
								currentIndex,
								firstIndex,
							);
							// current < previous < first
						} else {
							updateSelectionSetFromRange(
								selectionRangeMode.current,
								currentIndex,
								previousIndex,
							);
						}
					}
					selectionRange.current[1] = currentIndex;
					updateSelections();
				};

				const startSelectionInteraction = (e: PointerEvent) => {
					if (!containerRef.current) {
						return;
					}

					const { clientX, clientY } = e;
					initialPointerDown.current = [clientX, clientY];
					e.stopImmediatePropagation();
					containerRef.current.style.touchAction = 'none';
					containerRef.current.setPointerCapture(e.pointerId);
					containerRef.current.onpointermove = onPointerMove;
					pointerId.current = e.pointerId;
					return;
				};

				containerRef.current.onpointerdown = startSelectionInteraction;
				containerRef.current.onpointerup = endPointerInteraction;
				containerRef.current.onpointercancel = endPointerInteraction;

				return () => {
					console.warn('Unmounting!');
					if (containerRef.current) {
						containerRef.current.onpointerdown = null;
						containerRef.current.onpointerup = null;
						containerRef.current.onpointercancel = null;
						containerRef.current.style.touchAction = 'unset';
					}
					endPointerInteraction();
					scrollAction.current = false;
				};
			}
		}, [selectionModeEnabled, mediaChunks, containerRef]);

		const Container = GalleryMap[
			style
		] as (typeof GalleryMap)[typeof style] &
			React.ForwardRefExoticComponent<
				{
					style: GalleryStyle;
				} & PropsWithChildren
			>;
		return (
			<Container ref={containerRef} style={style as any}>
				{mediaChunks.map((chunk, index) => (
					<MediaItemsChunk
						key={index}
						items={chunk.results}
						chunkIndexOffset={itemsPerChunk * index}
						selections={selections}
						onImageClick={onImageClick}
						selectionModeEnabled={selectionModeEnabled}
					/>
				))}
			</Container>
		);
	},
);
