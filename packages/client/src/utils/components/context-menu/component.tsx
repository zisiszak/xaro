import { forwardRef, useEffect } from 'react';
import { useForwardedRef } from '../../hooks/use-forwarded-ref.js';
import * as S from './component.styles.js';

export interface AnchorMenuItem {
	label: string;
	href: string;
	target: string;
}
export interface ActionMenuItem {
	label: string;
	onClick: () => void;
}
export type AnyMenuItem = AnchorMenuItem | ActionMenuItem;

export interface Props {
	mouseX: number;
	mouseY: number;
	title?: string;
	copyContent?: string;
	items: AnyMenuItem[];
}

// TODO: Replace this with createCssVar
const xCssVar = '--context-menu-x';
const yCssVar = '--context-menu-y';

export const Component = forwardRef<HTMLDivElement, Props>(
	({ mouseX, mouseY, title, copyContent, items }, ref) => {
		const containerRef = useForwardedRef(ref);

		// const containerRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (containerRef.current === null) {
				return;
			}

			const { innerWidth, innerHeight } = window;
			const { width = 0, height = 0 } = containerRef.current.getBoundingClientRect();
			const x = mouseX + width > innerWidth ? mouseX - width : mouseX;
			const y = mouseY + height > innerHeight ? mouseY - height : mouseY;

			containerRef.current.style.setProperty(xCssVar, `${x}px`);
			containerRef.current.style.setProperty(yCssVar, `${y}px`);
		}, [containerRef]);

		const fixContainerWidth = () =>
			containerRef.current !== null &&
			(containerRef.current.style.width = `${containerRef.current.getBoundingClientRect().width}px`);

		const handleCopyContent = (e: React.MouseEvent<HTMLButtonElement>) => {
			const target = e.currentTarget as HTMLButtonElement;
			e.preventDefault();
			e.stopPropagation();
			fixContainerWidth();
			navigator.clipboard
				.writeText(copyContent ?? '')
				.then(() => {
					target.innerText = 'Copied';
				})
				.catch((err) => {
					console.error(err);
				});
		};

		const handleExternalLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
			fixContainerWidth();
			e.currentTarget.innerText = 'Opening...';

			window.onbeforeunload = () => {
				e.currentTarget.innerText = 'Open';
			};
		};

		return (
			<S.Container
				$xCssVar={xCssVar}
				$yCssVar={yCssVar}
				ref={containerRef}
				onMouseDown={(e) => e.stopPropagation()}
			>
				<div ref={ref}></div>
				{title && <S.Title>{title}</S.Title>}
				<S.List>
					{typeof copyContent === 'string' && (
						<S.Item as="button" onClick={handleCopyContent}>
							{copyContent}
						</S.Item>
					)}
					{items.map((item, index) => {
						// this should be moved to a separate component
						if ('href' in item) {
							return (
								<S.Item
									key={index}
									as="a"
									href={item.href}
									target={item.target}
									onClick={handleExternalLink}
								>
									{item.label}
								</S.Item>
							);
						}
						return (
							<S.Item as="button" key={index} onClick={item.onClick}>
								{item.label}
							</S.Item>
						);
					})}
				</S.List>
			</S.Container>
		);
	},
);
