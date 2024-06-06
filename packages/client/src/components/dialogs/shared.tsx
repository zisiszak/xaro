import { MouseEvent, PropsWithChildren, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { colour } from '../../styleguide/colour';
import { factor } from '../../styleguide/factor';
import { useLockBodyScroll } from '../../utils/hooks/use-lock-body-scroll';

const FullPageWrap = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;

	font-size: ${factor.LG(1)};

	position: fixed;
	inset: 0;
	z-index: 10000;
	overflow: hidden;

	padding: 1em;

	width: 100%;
	height: 100%;

	background-color: rgb(0 0 0 / 0.75);
`;

const DialogTile = styled.div`
	position: relative;
	font-size: ${factor.MD(1)};

	max-height: 100%;
	height: auto;
	overflow: hidden auto;

	background-color: ${colour.background.mainMinus};
	color: ${colour.text.main};

	box-shadow: 0 0 1em 0 rgb(0 0 0 / 0.3);
`;

const DialogTileTopWrap = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: flex-start;

	padding: 2em 1em;

	background-color: ${colour.background.mainPlus};
	color: ${colour.text.main};
	border-bottom: 1px solid ${colour.text.main10};
`;

const DialogDetailsWrap = styled.div``;

const DialogTitle = styled.h2`
	flex: auto;
	font-weight: 700;
	font-size: ${factor.LG(1)};
	margin: 0;
`;

const DialogContentWrap = styled.div`
	padding: 2em;
`;

const DialogCloseButton = styled.button`
	display: inline-block;
	flex: none;
	margin-left: auto;
	padding: 0.5em 1em;

	font-size: ${factor.MD(0.875)};
	font-weight: 500;

	background-color: ${colour.background.mainMinus};
	border-radius: 0.5em;
	border: solid 1px ${colour.text.main10};
	color: ${colour.text.main75};

	&:hover {
		color: ${colour.text.main};
		border-color: ${colour.text.main};
	}
`;

export interface GenericDialogProps {
	title: string;
	clickBackgroundToClose?: boolean;
	close: () => void;
}
export const GenericDialog: React.FC<
	PropsWithChildren & GenericDialogProps
> = ({ children, title, clickBackgroundToClose = true, close }) => {
	useLockBodyScroll();
	const tileRef = useRef<HTMLDivElement>(null);

	const onBackgroundClick = clickBackgroundToClose
		? (e: MouseEvent<HTMLDivElement>) => {
				if (
					!tileRef.current ||
					e.target === tileRef.current ||
					!clickBackgroundToClose ||
					tileRef.current.contains(e.target as Node)
				) {
					return;
				}

				e.preventDefault();
				e.stopPropagation();
				close();
			}
		: undefined;

	return (
		<>
			{createPortal(
				<FullPageWrap onPointerDown={onBackgroundClick}>
					<DialogTile ref={tileRef}>
						<DialogTileTopWrap>
							<DialogDetailsWrap>
								<DialogTitle>{title}</DialogTitle>
							</DialogDetailsWrap>
							<DialogCloseButton onClick={close}>
								close
							</DialogCloseButton>
						</DialogTileTopWrap>
						<DialogContentWrap>{children}</DialogContentWrap>
					</DialogTile>
				</FullPageWrap>,
				document.body,
			)}
		</>
	);
};
