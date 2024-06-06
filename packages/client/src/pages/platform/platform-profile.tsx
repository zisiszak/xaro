import { type ServerAPI } from '@xaro/server';
import { cleanInt } from '@xaro/utils';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Thumbnail } from '../../components/thumbnail/thumbnail.js';
import { loadContentItems } from '../../model/loaders/content/load-content-items.js';
import { loadAboutPlatformProfile } from '../../model/loaders/platform-profile/load-about-platform-profile.js';
import { Grid } from '../all-media/all-platform-media.styles.js';
import * as S from './platform-profile.styles.js';

export const PlatformProfilePage: React.FC = () => {
	const loaderData = useParams<{
		// platform: string;
		profileId: string;
	}>();
	// const platform = loaderData.platform ?? null;
	const profileId = cleanInt(loaderData.profileId) ?? null;

	const [platformProfile, setPlatformProfile] =
		useState<null | ServerAPI.GetAboutPlatformProfile.Success>(null);
	const [linkedContent, setLinkedContent] =
		useState<null | ServerAPI.GetAllContent.Success>(null);

	loadAboutPlatformProfile({
		setPlatformProfile: setPlatformProfile,
		platformProfileId: profileId,
	});
	loadContentItems({
		setContentItems: setLinkedContent,
		queryParams: {
			platformProfileId: profileId ?? undefined,
		},
	});

	if (platformProfile === null) return null;

	const { profile, platformName } = platformProfile;
	const description = profile.description
		? new DOMParser().parseFromString(profile.description, 'text/html')
				.documentElement.textContent
		: null;
	const staticGetUrlBase = `/static.get/platform/${platformName}/profile/${profile.name}`;

	return (
		<>
			<S.HeaderSection>
				<S.HeaderImageContainer>
					{profile.assets.banner && (
						<S.HeaderBannerImage
							src={`${staticGetUrlBase}/${profile.assets.banner}`}
							loading="lazy"
						/>
					)}
				</S.HeaderImageContainer>
				<S.HeaderContentContainer>
					<S.HeaderContentTile>
						<S.HeaderAvatarNameWrap>
							{profile.assets.avatar && (
								<S.HeaderAvatar
									src={`${staticGetUrlBase}/${profile.assets.avatar}`}
									loading="lazy"
								/>
							)}
							<S.NameLinkWrap>
								<S.HeaderProfileName>
									{profile.displayName}
								</S.HeaderProfileName>
								{profile.sourceUrl && (
									<S.ProfileExternalLink
										href={profile.sourceUrl}
										target="_blank"
									>
										(view on reddit)
									</S.ProfileExternalLink>
								)}
							</S.NameLinkWrap>
						</S.HeaderAvatarNameWrap>
						<S.ProfileDetails>
							{profile.subscribers !== null && (
								<S.ProfileSubscriberCount>
									{profile.subscribers} subscribers
								</S.ProfileSubscriberCount>
							)}
							{description && (
								<S.ProfileDescription>
									{description}
								</S.ProfileDescription>
							)}
							<S.CustomDetails>
								<S.HeaderTotalCount>
									Posts Downloaded:{' '}
									{linkedContent
										? linkedContent.totalCount
										: 'Loading...'}
								</S.HeaderTotalCount>
							</S.CustomDetails>
						</S.ProfileDetails>
					</S.HeaderContentTile>
				</S.HeaderContentContainer>
			</S.HeaderSection>
			{linkedContent && (
				<S.GridSection>
					<Grid galleryStyle="column">
						{linkedContent.results.map((e) =>
							Thumbnail({
								content: e,
								onClick: () => {
									window.location.href = `/content?id=${e.record.id}`;
								},
							}),
						)}
					</Grid>
				</S.GridSection>
			)}
		</>
	);
};
