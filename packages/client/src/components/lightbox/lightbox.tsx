import ReactPlayer from 'react-player';
import Lightbox from 'yet-another-react-lightbox';
import './lightbox.css';
import G from './lightbox.module.css';

interface YARLightboxProps {
	index: number;
	setIndex: (absoluteIndex: number) => void;
	requestFetchOnIndex: number;
	slides: {
		src: string;
		kind: 'video' | 'image';
		action?: (s: string) => string;
		title?: string | null;
	}[];
}

export const YARLightbox: React.FC<YARLightboxProps> = ({
	setIndex,
	slides,
	index,
	requestFetchOnIndex,
}) => {
	return (
		<Lightbox
			index={index}
			open={index !== -1}
			close={() => setIndex(-1)}
			on={{
				view: ({ index }) => {
					console.log(index);
					if (index >= requestFetchOnIndex) setIndex(index);
				},
			}}
			slides={slides}
			portal={{
				root: document.getElementById('root') as HTMLElement,
			}}
			noScroll={{ disabled: false }}
			carousel={{
				finite: true,
				imageFit: 'contain',
				preload: 0,
			}}
			animation={{
				fade: 200,
				swipe: 250,
				easing: {
					fade: 'ease-in-out',
					navigation: 'ease-in-out',
					swipe: 'ease-out',
				},
			}}
			render={{
				slide: ({ slide }) => {
					if (!slide) return null;

					const vid = (slide as any).kind === 'video';
					const src = slide.src;

					return (
						<div
							className={`${G.lightboxWrap} ${
								vid ? G.lightboxVideoWrap : G.lightboxImageWrap
							}`}
						>
							{vid ? (
								<div>
									{/* {src !== null && ( */}
									{
										<ReactPlayer
											width={'100%'}
											height={'100%'}
											style={{
												overflow: 'hidden',
												maxWidth: '100vw',
												maxHeight: '100vh',
												objectFit: 'contain',
												width: '100%',
												height: '100%',
												minWidth: '100%',
												minHeight: '100%',
											}}
											url={src}
											controls
											playing
											pip
											stopOnUnmount={true}
											playsinline={true}
										/>
									}
								</div>
							) : (
								<img className={G.lightboxImage} src={src} />
							)}
							{(typeof (slide as any).title as string) !==
							'undefined' ? (
								<p className={G.lightboxTitle}>
									{(slide as any).title}
								</p>
							) : null}
						</div>
					);
				},
			}}
			controller={{
				closeOnBackdropClick: false,
				closeOnPullDown: true,
			}}
			styles={{
				slide: {
					overflow: 'hidden',
					objectFit: 'contain',
					padding: '0',
					position: 'static',
					margin: '0',
				},
				root: {
					padding: '0',
					top: 0,
					bottom: 'auto',
					height: '100dvh',
					margin: '0',
				},
				toolbar: {
					bottom: 0,
					top: 'auto',
				},
				button: {
					bottom: 0,
					zIndex: 100,
					// background: 'rgba(0, 0, 0, 0.85)',						backgroundColor: colour.background.mainMinus,
					position: 'absolute',
					width: 'fit-content',

					// top: '0',
				},
				container: {
					padding: '0',
					margin: '0',
					backgroundColor: 'black',
				},
				navigationNext: {
					display: 'none',
				},
				navigationPrev: {
					display: 'none',
				},
			}}
		/>
	);
};
