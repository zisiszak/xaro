import { type ServerAPI } from '@xaro/server';
import { cleanString } from '@xaro/utils';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TagsFlex } from '../../components/content-item/column-item.styles.js';
import { YARLightbox } from '../../components/lightbox/lightbox.js';
import {
	useViewPreferences,
	type GalleryStyle,
} from '../../model/context/view-preferences.js';
import { loadContentSortingTags } from '../../model/loaders/content/load-content-sorting-tags.js';
import { loadPlatformCommunities } from '../../model/loaders/platform-community/load-platform-communities.js';
import { loadAboutPlatform } from '../../model/loaders/platform/load-about-platform.js';
import { FormPrimitive } from '../../styleguide/components/index.js';
import { Primitive } from '../../styleguide/index.js';
import { compareStrings } from '../../utils/parsing-and-sorting/sort.js';
import { appendLocationSearch } from '../../utils/window-location.js';
import * as S from './all-platform-media.styles.js';
import { Gallery } from './gallery.js';
import { SortingTagFilter } from './sorting-tag-filter.js';

const endOfPageScrollOffset = 100;
const itemsPerChunk: Record<GalleryStyle, number> = {
	'square-grid-lg': 12,
	'square-grid-md': 12,
	'square-grid-sm': 25,
	column: 5,
	list: 20,
};

export const PlatformAllMediaPage: React.FC = () => {
	const {
		communityId: initCommunityId,
		orderBy: initOrderBy,
		direction: initDir,
		search: initSearch,
		favourite: initFavourite,
		minRating: initMinRating,
		sortingTags: initSortingTags,
	} = queryString.parse(location.search);
	const { platform } = useParams<{ platform: string }>();

	const { viewPreferences, updateViewPreferences } = useViewPreferences();
	const { galleryStyle } = viewPreferences;

	const [hasReachedEndOfPage, setHasReachedEndOfPage] =
		useState<boolean>(false);
	const [nextChunkIsLoading, setNextChunkIsLoading] =
		useState<boolean>(false);
	const [mediaChunks, setMediaChunks] = useState<
		ServerAPI.GetAllContent.Success[]
	>([]);
	const [updateRequired, setUpdateRequired] = useState<boolean>(true);
	const [selectionModeEnabled, setSelectionModeEnabled] =
		useState<boolean>(false);
	const [loadedCount, setLoadedCount] = useState<number | null>(0);
	const [platformCommunities, setPlatformCommunities] =
		useState<ServerAPI.GetAllPlatformCommunities.Success | null>(null);
	const [aboutPlatform, setAboutPlatform] =
		useState<ServerAPI.GetAboutPlatform.Success | null>(null);
	const [viewing, setViewing] = useState<number>(-1);
	const [availableSorting, setAvailableSorting] =
		useState<ServerAPI.GetContentSortingTags.Success | null>(null);

	const selectedSortingTagsRef = useRef<Set<string>>(
		new Set(
			Array.isArray(initSortingTags)
				? initSortingTags.filter((v): v is string => !!v)
				: typeof initSortingTags === 'string'
					? [initSortingTags]
					: [],
		),
	);
	const loadedCountRef = useRef<number | null>(0);
	const contentCountRef = useRef<number>(-1);
	const gallerySectionRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const nextChunkLoadingRef = useRef(nextChunkIsLoading);

	const orderBy =
		typeof initOrderBy === 'string'
			? initOrderBy
			: 'PlatformLinkedContent.title';
	const direction = initDir === 'desc' ? 'desc' : 'asc';
	const filterByCommunityId: number | null =
		typeof initCommunityId === 'string' && initCommunityId !== ''
			? +initCommunityId
			: null;
	const search = cleanString(initSearch);
	const favourite = initFavourite === 'true' ? true : undefined;
	const minRating =
		initMinRating === 'none'
			? undefined
			: typeof initMinRating === 'string'
				? (parseInt(initMinRating) as 1 | 2 | 3 | 4 | 5)
				: undefined;

	const query = {
		platform: platform ?? undefined,
		offset: loadedCountRef.current ?? 0,
		limit: itemsPerChunk[galleryStyle],
		search: search,
		isFavourite: favourite,
		minRating: minRating,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		orderBy: orderBy as any,
		direction,
		platformCommunityId: filterByCommunityId ?? undefined,
		sortingTags: (initSortingTags ?? undefined) as string[] | undefined,
	} satisfies ServerAPI.GetAllContent.Query;

	const toggleSortingTagSelection = (displayName: string) => {
		if (selectedSortingTagsRef.current.has(displayName)) {
			selectedSortingTagsRef.current.delete(displayName);
		} else {
			selectedSortingTagsRef.current.add(displayName);
		}
	};

	useEffect(() => {
		loadedCountRef.current = mediaChunks.reduce(
			(prev, curr) => prev + (curr.results.length ?? 0),
			0,
		);
		setLoadedCount(loadedCountRef.current);
		contentCountRef.current = mediaChunks[0]?.totalCount ?? -1;
	}, [mediaChunks]);

	useEffect(() => {
		const handleScroll = () => {
			const grid = gallerySectionRef.current;
			if (
				grid === null ||
				loadedCountRef.current === null ||
				(contentCountRef.current !== -1 &&
					loadedCountRef.current >= contentCountRef.current) ||
				nextChunkLoadingRef.current
			) {
				return;
			}
			const bounding = grid.getBoundingClientRect().bottom;
			const windowHeight = window.innerHeight + endOfPageScrollOffset;
			setHasReachedEndOfPage(bounding < windowHeight);
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [gallerySectionRef]);

	useEffect(() => {
		if (
			nextChunkIsLoading ||
			loadedCount === null ||
			contentCountRef.current === -1 ||
			loadedCount >= contentCountRef.current
		) {
			return;
		}

		if (viewing === -1) {
			if (hasReachedEndOfPage) {
				setUpdateRequired(true);
			} else {
				setUpdateRequired(false);
			}
		} else if (viewing > loadedCount - 3) {
			setUpdateRequired(true);
		} else {
			setUpdateRequired(false);
		}
	}, [hasReachedEndOfPage, viewing]);

	useEffect(() => {
		if (!updateRequired || nextChunkIsLoading) {
			return;
		}
		setNextChunkIsLoading(true);
		nextChunkLoadingRef.current = true;
		setUpdateRequired(false);

		const fetchContentUrl = queryString.stringifyUrl({
			url: '/api/content',
			query: query,
		});

		fetch(fetchContentUrl, {
			method: 'GET',
		})
			.then((response) => {
				if (response.status !== 200) {
					console.error({
						status: response.status,
						statusText: response.statusText,
					});
					return Promise.reject();
				}
				return response.json() as Promise<ServerAPI.GetAllContent.Success>;
			})
			.then((result) => {
				setNextChunkIsLoading(false);
				setHasReachedEndOfPage(false);
				nextChunkLoadingRef.current = false;
				if (result.results.length !== 0) {
					setMediaChunks((prev) => {
						if (
							prev[0] &&
							JSON.stringify(prev[0]) === JSON.stringify(result)
						) {
							return prev;
						}
						return [...prev, result];
					});
				} else {
					console.warn(`No items found for chunk range.`);
				}
			})
			.catch((err) => {
				console.error(err);
				setHasReachedEndOfPage(false);
				loadedCountRef.current = null;
				setNextChunkIsLoading(false);
				nextChunkLoadingRef.current = false;
			});
	}, [updateRequired]);

	useEffect(() => {
		const grid = gallerySectionRef.current;

		if (
			grid === null ||
			loadedCountRef.current === null ||
			(contentCountRef.current !== -1 &&
				loadedCountRef.current >= contentCountRef.current) ||
			nextChunkLoadingRef.current === true
		) {
			return;
		}
		if (
			window.innerHeight + endOfPageScrollOffset >
			document.documentElement.scrollHeight
		) {
			setHasReachedEndOfPage(true);
		}
	}, [galleryStyle]);

	useEffect(() => {
		if (mediaChunks.length > 0 && loadedCount) {
			const numItemsPerChunk = itemsPerChunk[galleryStyle];
			if (
				mediaChunks.some(
					(chunk, i) =>
						chunk.results.length !== numItemsPerChunk &&
						i !== mediaChunks.length - 1,
				)
			) {
				setMediaChunks((mediaChunks) => {
					const { parsedFilters, parsedSorting, totalCount } =
						mediaChunks[0]!;
					const flattened = mediaChunks
						.flatMap((chunk) => chunk.results)
						.filter((v) => !!v);
					const newChunkArrayLength = Math.ceil(
						flattened.length / numItemsPerChunk,
					);
					const updatedChunks: ServerAPI.GetAllContent.Success[] = [];
					for (let i = 0; i < newChunkArrayLength; i++) {
						const spliced = flattened.splice(0, numItemsPerChunk);
						if (spliced.length === 0) {
							break;
						}
						updatedChunks.push({
							parsedFilters,
							parsedSorting,
							totalCount,
							results: spliced,
						});
					}
					return updatedChunks;
				});
			}
		}
	}, [mediaChunks, galleryStyle]);

	loadAboutPlatform({
		setPlatform: setAboutPlatform,
		platformName: platform ?? null,
	});

	loadPlatformCommunities({
		setCommunities: setPlatformCommunities,
		platformName: platform ?? null,
	});

	loadContentSortingTags({
		setContentSortingTags: setAvailableSorting,
		queryParams: query,
	});

	if (
		aboutPlatform === null ||
		typeof platform === 'undefined' ||
		loadedCountRef.current === null
	) {
		return null;
	}

	const lightboxSlides = mediaChunks
		.flatMap((results) => results.results)
		.map((result) => ({
			kind: result.record.kind,
			src: result.files.original?.staticPath ?? '',
			title: result.record.title,
		}));

	return (
		<>
			<S.Header>
				<S.Title>All Media: {aboutPlatform.displayName}</S.Title>
				{contentCountRef.current !== -1 && (
					<S.Description>
						{contentCountRef.current} result
						{contentCountRef.current > 1 ? 's' : ''} found.
					</S.Description>
				)}
				<Primitive.Container.SM>
					<FormPrimitive.ItemsContainer>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Filter by Community
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Select
								value={filterByCommunityId ?? ''}
								onChange={(e) =>
									appendLocationSearch({
										page: 1,
										communityId: e.target.value,
									})
								}
							>
								<option value="">All</option>
								{platformCommunities &&
									[...platformCommunities.results]
										.sort((a, b) =>
											compareStrings(
												a.displayName.toLowerCase(),
												b.displayName.toLowerCase(),
											),
										)
										.map((community) => (
											<option
												key={community.id}
												value={community.id}
											>
												{community.displayName}
											</option>
										))}
							</FormPrimitive.item.Select>
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Sort by
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Select
								value={orderBy ?? 'PlatformLinkedContent.title'}
								onChange={(e) => {
									let orderBy;
									switch (e.target.value) {
										case '':
											orderBy = undefined;
											break;
										default:
											orderBy = e.target.value as never;
											break;
									}
									appendLocationSearch({
										page: 1,
										orderBy,
									});
								}}
							>
								<option value="PlatformLinkedContent.title">
									Title
								</option>
								<option value="Content.dateAdded">
									Date Added
								</option>
								<option value="PlatformLinkedContent.likeCount">
									Likes
								</option>
								<option value="PlatformLinkedContent.linkedPlatformProfileId">
									Profile
								</option>
							</FormPrimitive.item.Select>
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Sort direction
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Select
								value={direction}
								onChange={(e) => {
									const v =
										e.currentTarget.value === 'asc'
											? 'asc'
											: e.currentTarget.value === 'desc'
												? 'desc'
												: direction;

									if (v !== direction) {
										appendLocationSearch({
											page: 1,
											direction: v,
										});
									}
								}}
							>
								<option value="asc">Ascending</option>
								<option value="desc">
									Descending (default)
								</option>
							</FormPrimitive.item.Select>
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Minimum Rating
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Select
								defaultValue={minRating}
								onChange={(e) => {
									const v =
										e.currentTarget.value === 'none'
											? null
											: (parseInt(
													e.currentTarget.value,
												) as 1 | 2 | 3 | 4 | 5);

									if (v !== minRating) {
										appendLocationSearch({
											minRating: v,
										});
									}
								}}
							>
								<option value="none">None</option>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
							</FormPrimitive.item.Select>
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Favourited?
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Checkbox
								defaultChecked={favourite}
								onChange={(e) => {
									if (e.currentTarget.checked !== favourite) {
										appendLocationSearch({
											favourite: e.currentTarget.checked,
										});
									}
								}}
							/>
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Gallery Style
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Select
								value={galleryStyle}
								onChange={(e) => {
									const v = e.currentTarget
										.value as GalleryStyle;
									updateViewPreferences({
										galleryStyle: v,
									});
								}}
							>
								<option value={'square-grid-sm'}>
									Square Grid: Small
								</option>
								<option value={'square-grid-md'}>
									Square Grid: Medium
								</option>
								<option value={'square-grid-lg'}>
									Square Grid: Large
								</option>
								<option value={'column'}>Column</option>
								<option value={'list'}>List</option>
							</FormPrimitive.item.Select>
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							{availableSorting && (
								<TagsFlex>
									{availableSorting.sortingTags.map((tag) => (
										<SortingTagFilter
											key={tag.id}
											initiallySelected={selectedSortingTagsRef.current.has(
												tag.displayName,
											)}
											{...tag}
											toggleSelection={
												toggleSortingTagSelection
											}
										/>
									))}
								</TagsFlex>
							)}
						</FormPrimitive.item.Container>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Search
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Text
								defaultValue={search}
								ref={searchRef}
								type="text"
							/>
							<FormPrimitive.buttons.Submit
								onClick={(e) => {
									e.preventDefault();
									if (!searchRef.current) {
										return;
									}
									appendLocationSearch({
										search:
											searchRef.current.value === ''
												? undefined
												: searchRef.current.value,
										sortingTags:
											selectedSortingTagsRef.current
												.size > 0
												? Array.from(
														selectedSortingTagsRef.current,
													)
												: undefined,
									});
								}}
								value={'Apply search'}
							/>
						</FormPrimitive.item.Container>
					</FormPrimitive.ItemsContainer>
				</Primitive.Container.SM>
				<Primitive.Container.SM>
					<FormPrimitive.item.Container>
						<FormPrimitive.item.Label>
							Enable Selection Mode
						</FormPrimitive.item.Label>
						<FormPrimitive.item.Checkbox
							defaultChecked={false}
							onChange={(e) => {
								setSelectionModeEnabled(
									e.currentTarget.checked,
								);
							}}
						/>
					</FormPrimitive.item.Container>
				</Primitive.Container.SM>
			</S.Header>
			<Gallery
				mediaChunks={mediaChunks}
				selectionModeEnabled={selectionModeEnabled}
				style={galleryStyle}
				ref={gallerySectionRef}
				onImageClick={setViewing}
				itemsPerChunk={itemsPerChunk[galleryStyle]}
			/>
			<YARLightbox
				index={viewing}
				setIndex={setViewing}
				requestFetchOnIndex={loadedCount ? loadedCount - 3 : 0}
				slides={lightboxSlides}
			/>
		</>
	);
};
