import React, { memo, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Component, type Props } from './component.js';

export const Context = React.createContext<
	(props: Omit<Props, 'close' | 'mouseX' | 'mouseY'>) => (e: React.MouseEvent) => void
>(null as never);

// TODO: Review this cos it looks a bit chaotic to say the least
export const ContextProvider = memo<PropsWithChildren>(({ children }) => {
	const [contextMenu, setContextMenu] = useState<Omit<Props, 'close'> | null>(null);

	const openContextMenu = useMemo(() => {
		return (props: Omit<Props, 'close' | 'mouseX' | 'mouseY'>) => (e: React.MouseEvent) => {
			e.preventDefault();
			setContextMenu({
				...props,
				mouseX: e.clientX,
				mouseY: e.clientY,
			});
		};
	}, []);
	const closeContextMenu = () => setContextMenu(null);

	const contextMenuRef = React.useRef<HTMLDivElement>(null);
	const handleClose = (e: globalThis.MouseEvent) => {
		console.log(e.currentTarget);

		if (contextMenuRef.current !== null && contextMenuRef.current !== e.currentTarget) {
			closeContextMenu();
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClose);
		return () => document.removeEventListener('mousedown', handleClose);
	}, []);

	return (
		<>
			<Context.Provider value={openContextMenu}>{children}</Context.Provider>
			{contextMenu && <Component {...contextMenu} ref={contextMenuRef} />}
		</>
	);
});
export const useContext = () => React.useContext(Context);
