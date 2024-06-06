import { type ServerAPI } from '@xaro/server';
import { useState } from 'react';
import { loadContentItems } from '../../../model/loaders/content/load-content-items.js';
import { colour } from '../../../styleguide/colour.js';
import { PreviewThumbsGrid } from './preview-thumbs-grid.js';
import * as S from './tile.styles.js';

export type PlatformProfileTileProps =
	ServerAPI.GetAboutPlatformProfile.Success;

export const PlatformProfileTile: React.FC<PlatformProfileTileProps> = ({
	profile: {
		description: desc,
		id,
		assets,
		name,
		linkedPlatformId,
		displayName,
		subscribers,
	},
	platformName,
}) => {
	const [linkedContent, setLinkedContent] =
		useState<null | ServerAPI.GetAllContent.Success>(null);
	loadContentItems({
		queryParams: {
			platformId: linkedPlatformId,
			platformProfileId: id,
			limit: 3,
			offset: 0,
		},
		setContentItems: setLinkedContent,
	});

	const description = desc
		? new DOMParser().parseFromString(desc, 'text/html').documentElement
				.textContent
		: null;

	return (
		<S.Wrap href={`/platform-profiles/${id}`}>
			<S.DetailsWrap>
				{!!assets.avatar && (
					<S.IconWrap $primaryColor={colour.accent.info}>
						<S.Icon
							src={`/static.get/platform/${platformName}/profile/${name}/${assets.avatar}`}
						/>
					</S.IconWrap>
				)}
				{<S.Name>{displayName}</S.Name>}
				{!!description && <S.Description>{description}</S.Description>}
				{subscribers !== null && (
					<S.Description>
						{subscribers ?? 0} subscribers
					</S.Description>
				)}
				{linkedContent && (
					<S.PostsDownloaded>
						{linkedContent.totalCount} posts(s)
					</S.PostsDownloaded>
				)}
			</S.DetailsWrap>
			{linkedContent && (
				<PreviewThumbsGrid
					thumbs={linkedContent.results
						.slice(0, 3)
						.map((r) => ({ kind: r.record.kind, files: r.files }))}
				/>
			)}
		</S.Wrap>
	);
};
