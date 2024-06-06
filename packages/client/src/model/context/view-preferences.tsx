import {
	createContext,
	useContext,
	useState,
	type PropsWithChildren,
} from 'react';

export type GalleryStyle =
	| 'square-grid-sm'
	| 'square-grid-md'
	| 'square-grid-lg'
	| 'column'
	| 'list';
export type ViewPreferences = {
	galleryStyle: GalleryStyle;
	autoPlayGifs: boolean;
};
export type ViewPreferencesContext = {
	viewPreferences: ViewPreferences;
	updateViewPreferences: (preferences: Partial<ViewPreferences>) => void;
	resetViewPreferences: () => void;
};

const viewPreferencesContext = createContext<ViewPreferencesContext>(
	null as never,
);

export const ViewPreferencesContextProvider: React.FC<PropsWithChildren> = ({
	children,
}) => {
	const galleryStyle = window.localStorage.getItem(
		'zmh.viewPreferences.galleryStyle',
	) as GalleryStyle | null;
	console.log(galleryStyle);

	const [viewPreferences, setViewPreferences] = useState<ViewPreferences>({
		galleryStyle:
			(window.localStorage.getItem(
				'zmh.viewPreferences.galleryStyle',
			) as GalleryStyle | null) ?? 'list',
		autoPlayGifs: Boolean(
			+(
				window.localStorage.getItem(
					'zmh.viewPreferencess.autoPlayGifs',
				) ?? 1
			),
		),
	});

	const updateViewPreferences = (
		updatedPreferences: Partial<ViewPreferences>,
	) => {
		Object.entries(updatedPreferences).forEach(([key, value]) => {
			const itemKey = `zmh.viewPreferences.${key}`;
			if (typeof value === 'undefined') {
				window.localStorage.removeItem(itemKey);
			} else {
				window.localStorage.setItem(
					itemKey,
					typeof value === 'string' || typeof value === 'number'
						? value.toString()
						: value === true
							? '1'
							: '0',
				);
			}
		});
		setViewPreferences((prev) => ({ ...prev, ...updatedPreferences }));
	};
	const resetViewPreferences = () =>
		Object.entries(viewPreferences).forEach(([key]) =>
			window.localStorage.removeItem(`zmh.viewPreferences.${key}`),
		);

	const Provider = viewPreferencesContext.Provider;

	return (
		<Provider
			value={{
				viewPreferences,
				resetViewPreferences,
				updateViewPreferences,
			}}
		>
			{children}
		</Provider>
	);
};

export const useViewPreferences = () => useContext(viewPreferencesContext);
