import { useLayoutEffect } from 'react';

/**
 * Locks the body scroll when the component is mounted and unlocks it when it is unmounted.
 */
export function useLockBodyScroll() {
	useLayoutEffect(() => {
		const initialStyle = window.getComputedStyle(document.body).overflow;
		const scrollBarCompensation =
			window.innerWidth - document.body.clientWidth;

		document.documentElement.style.overflow = 'hidden';
		document.body.style.paddingRight = `${scrollBarCompensation}px`;

		return () => {
			document.documentElement.style.overflow = initialStyle;
			document.body.style.paddingRight = '';
		};
	}, []);
}
