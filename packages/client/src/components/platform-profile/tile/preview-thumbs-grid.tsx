import { type ServerAPI } from '@xaro/server';
import { type CSSProperties } from 'react';
import { filterThumbnailSources } from '../../../utils/filter-thumbnail-sources.js';
import * as S from './preview-thumbs-grid.styles.js';

export type PreviewThumbsGridProps = {
	thumbs: {
		files: ServerAPI.GetAboutContent.Success['files'];
		kind: ServerAPI.GetAboutContent.Success['record']['kind'];
	}[];
};
export const PreviewThumbsGrid: React.FC<PreviewThumbsGridProps> = ({
	thumbs,
}) => {
	return (
		<S.PreviewImagesWrap>
			{thumbs &&
				thumbs.map(({ kind, files }, index) => {
					const imgSrc = filterThumbnailSources({ kind }, files, {
						galleryStyle: 'square-grid-sm',
					});
					if (imgSrc === null) {
						console.error(files, 'Media missing preview file(s)');
						return null;
					}
					return (
						<S.PreviewImage
							loading="eager"
							style={
								{
									'--index': index.toString(),
								} as CSSProperties
							}
							key={index}
							src={imgSrc.mainImageSrc.staticPath}
						/>
					);
				})}
		</S.PreviewImagesWrap>
	);
};
