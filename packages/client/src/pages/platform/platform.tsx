import { type ServerAPI } from '@xaro/server';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PaginationBar } from '../../components/pagination/bar.js';
import { PlatformProfileTile } from '../../components/platform-profile/tile/tile.js';
import { loadPlatformProfiles } from '../../model/loaders/platform-profile/load-platform-profiles.js';
import { loadAboutPlatform } from '../../model/loaders/platform/load-about-platform.js';
import { HeaderPrimitive } from '../../styleguide/components/index.js';
import { usePagination } from '../../utils/hooks/use-pagination.js';
import * as S from './platform.styles.js';

export const PlatformPage: React.FC = () => {
	const { platform } = useParams<{
		platform: string;
	}>();
	const { pageNumber, itemLimit, offset } = usePagination();

	const [aboutPlatform, setAboutPlatform] =
		useState<null | ServerAPI.GetAboutPlatform.Success>(null);
	const [platformProfiles, setPlatformProfiles] =
		useState<ServerAPI.GetAllPlatformProfiles.Success | null>(null);

	loadAboutPlatform({
		setPlatform: setAboutPlatform,
		platformName: platform ?? null,
	});
	loadPlatformProfiles({
		setPlatformProfiles: setPlatformProfiles,
		platformName: platform ?? null,
		offset,
		limit: itemLimit,
	});

	if (aboutPlatform === null || typeof platform === 'undefined') {
		return null;
	}

	const totalItemCount = platformProfiles?.totalCount ?? 0;

	return (
		<>
			{
				<HeaderPrimitive.Header>
					<HeaderPrimitive.detailsAndButtons.Wrap>
						<HeaderPrimitive.detailsAndButtons.DetailsWrap>
							<HeaderPrimitive.detailsAndButtons.Title>
								{aboutPlatform.displayName}
							</HeaderPrimitive.detailsAndButtons.Title>
							{aboutPlatform.description && (
								<HeaderPrimitive.detailsAndButtons.Description>
									{aboutPlatform.description}
								</HeaderPrimitive.detailsAndButtons.Description>
							)}
						</HeaderPrimitive.detailsAndButtons.DetailsWrap>
						<HeaderPrimitive.detailsAndButtons.ButtonsFlex>
							<HeaderPrimitive.detailsAndButtons.Button
								as="a"
								href={`/download/yt-dlp/${platform}`}
							>
								Download Videos
							</HeaderPrimitive.detailsAndButtons.Button>
							<HeaderPrimitive.detailsAndButtons.Button
								as="a"
								href={`/platforms/${platform}/all`}
							>
								All Media
							</HeaderPrimitive.detailsAndButtons.Button>
						</HeaderPrimitive.detailsAndButtons.ButtonsFlex>
					</HeaderPrimitive.detailsAndButtons.Wrap>
				</HeaderPrimitive.Header>
			}
			{platformProfiles && (
				<S.Grid>
					{platformProfiles.results.map((props, key) => (
						<PlatformProfileTile
							key={key}
							profile={props}
							platformId={props.linkedPlatformId}
							platformName={platform}
						/>
					))}
				</S.Grid>
			)}
			<PaginationBar
				totalItemCount={totalItemCount}
				pageNumber={pageNumber}
				itemLimit={itemLimit}
			/>
		</>
	);
};
