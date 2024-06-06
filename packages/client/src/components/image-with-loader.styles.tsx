import styled, { css, keyframes } from 'styled-components';

export const Wrap = styled.div`
	position: relative;
	width: 100%;
	height: auto;

	& img {
		overflow: hidden;
		position: relative;
		object-position: 50% 50%;
	}
`;

const keyframesLoading = keyframes`
    from {
        filter: blur(0.5rem) saturate(1);
        transform: scale(1.1);
    }
    to {
        filter: blur(0.5rem) saturate(0.5);
        transform: scale(1.1);
    }
`;

const onLoaded = keyframes`
	0% {
		filter: blur(0.5rem) saturate(1);
		transform: scale(1.1);
		opacity: 1;
	}
	100% {
		filter: blur(0) saturate(1);
		transform: scale(1);
		opacity: 1;
	}

`;

export const Preloader = styled.div`
	position: absolute;
	overflow: hidden;
	inset: 0;
`;

export const PreloadingImage = styled.img<{ $loaded: boolean }>`
	position: relative;
	min-height: 100%;
	min-width: 100%;
	width: 100%;
	height: 100%;
	object-fit: cover;
	overflow: hidden;
	animation: ${({ $loaded: loaded }) => css`
		${loaded ? onLoaded : keyframesLoading} ${loaded
			? '0.5s'
			: '2s'} ${loaded
			? 'ease-out forwards alternate 1'
			: 'ease-in forwards alternate infinite'}
	`};
`;

const spinnerKeyframes = keyframes`
    from {
        transform: translate3d(-50%, -50%, 0) rotate3d(0,0,1,0deg);
    }
    to {
        transform: translate3d(-50%, -50%, 0) rotate3d(0,0,1,360deg);
    }
`;

export const PreloaderSpinner = styled.div`
	display: block;
	content: '';
	top: 50%;
	left: 50%;
	position: absolute;

	border: 2px solid white;
	border-radius: 50%;
	height: 0.75rem;
	width: 0.75rem;
	z-index: 10;

	clip-path: polygon(
		100% 0,
		100% 0,
		100% 52%,
		100% 99%,
		57% 100%,
		0% 99%,
		0% 51%,
		0% 0%,
		0 0,
		50% 50%
	);

	transform-origin: 50% 50%;
	animation: ${spinnerKeyframes} 1s ease-in-out infinite running;
`;
