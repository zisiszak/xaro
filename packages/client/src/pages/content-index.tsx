import { type ServerAPI } from '@xaro/server';
import { cleanInt } from '@xaro/utils';
import queryString from 'query-string';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { loadAboutContent } from '../model/loaders/content/load-about-content.js';
import * as S from './content-index.styles.js';

export const ContentIndexPage: React.FC = () => {
	const contentId = cleanInt(queryString.parse(location.search).id) ?? null;
	const [content, setContent] =
		useState<ServerAPI.GetAboutContent.Success | null>(null);
	loadAboutContent({ contentId: contentId, setContent: setContent });

	if (contentId === null) return null;
	if (content === null) {
		return null;
	}

	const original = content.originalContentFile;
	if (!original) return null;

	const categories =
		(content.record.categories &&
			(JSON.parse(
				content.record.categories as unknown as string,
			) as string[])) ??
		[];
	const tags =
		(content.record.tags &&
			(JSON.parse(
				content.record.tags as unknown as string,
			) as string[])) ??
		[];

	const title = content.record.title;

	return (
		<S.Section>
			<S.Container>
				<S.MediaSidebarFlex>
					<S.MediaWrap>
						<S.ViewWrap>
							{content.record.kind === 'image' && (
								<S.ImageMedia
									src={`/static.media/${original.path}`}
								/>
							)}
							{content.record.kind === 'video' && (
								<ReactPlayer
									url={`/static.media/${original.path}`}
									controls
									width="100%"
									height="100%"
									wrapper={S.VideoMedia}
								/>
							)}
						</S.ViewWrap>
						{categories && (
							<S.CategoryFlex>
								{categories.map((category, index) => (
									<S.CategoryLabel key={index}>
										{category}
									</S.CategoryLabel>
								))}
							</S.CategoryFlex>
						)}
						{tags && (
							<S.CategoryFlex>
								{tags.map((tag, index) => (
									<S.CategoryLabel key={index}>
										{tag}
									</S.CategoryLabel>
								))}
							</S.CategoryFlex>
						)}
						{<S.MediaTitle>{title}</S.MediaTitle>}
						<a href={`/static.media/${original.path}`}>src</a>
						{content.record.linkedPlatformProfileId && (
							<S.PlatformUserWrap>
								<S.PlatformUsername
									as="a"
									href={`/platform-profiles/${content.record.linkedPlatformProfileId}`}
								>
									View Platform Profile
								</S.PlatformUsername>
							</S.PlatformUserWrap>
						)}
						{content.record.description && (
							<S.MediaDescription>
								{content.record.description}
							</S.MediaDescription>
						)}
					</S.MediaWrap>
					{/* <S.Sidebar></S.Sidebar> */}
				</S.MediaSidebarFlex>
			</S.Container>
		</S.Section>
	);
};
