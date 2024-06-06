import { type ServerAPI } from '@xaro/server';
import React, { useState } from 'react';
import * as S from './image-with-loader.styles';

export type ImageWithLoaderProps = {
	mainImageSrc: NonNullable<
		ServerAPI.GetAboutContent.Success['files']['original']
	>;

	preloadableImageSrc?: ServerAPI.GetAboutContent.Success['files']['original'];

	altText?: string;

	/** Does not affect the preloadable image loading mode.
	 * @defaultValue `'lazy'` */
	loading?: 'eager' | 'lazy';

	className?: string;
};
export const ImageWithLoader: React.FC<
	ImageWithLoaderProps & React.HTMLAttributes<HTMLDivElement>
> = ({
	mainImageSrc,
	preloadableImageSrc,
	loading = 'lazy',
	altText,
	...rest
}) => {
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isOnLoadAnimationComplete, setIsOnLoadAnimationComplete] =
		useState<boolean>(false);

	return (
		<S.Wrap {...rest}>
			<img
				loading={loading}
				// TODO: Make this smarter lol
				src={mainImageSrc.staticPath}
				style={
					mainImageSrc.width && mainImageSrc.height
						? {
								aspectRatio: `${mainImageSrc.width} / ${mainImageSrc.height}`,
							}
						: {}
				}
				alt={altText}
				onLoad={() => {
					setIsLoaded(true);
				}}
			/>
			{!isOnLoadAnimationComplete && preloadableImageSrc ? (
				<S.Preloader>
					{preloadableImageSrc && (
						<S.PreloadingImage
							onAnimationEnd={() => {
								if (isLoaded === false) {
									return;
								}

								setIsOnLoadAnimationComplete(true);
							}}
							$loaded={isLoaded}
							loading="eager"
							style={
								mainImageSrc.width && mainImageSrc.height
									? {
											aspectRatio: `${mainImageSrc.width} / ${mainImageSrc.height}`,
										}
									: {}
							}
							src={preloadableImageSrc.staticPath}
						/>
					)}
					<S.PreloaderSpinner />
				</S.Preloader>
			) : null}
		</S.Wrap>
	);
};
