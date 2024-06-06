import { Navigate } from 'react-router-dom';
import { Icons } from '../assets/index.js';
import { HomeNavigationItemGrid } from '../components/home/home-navigation-item-grid.js';
import {
	HomeNavigationItem,
	type HomeNavigationItemProps,
} from '../components/home/home-navigation-item.js';
import { useUser } from '../model/context/user.js';

const items: HomeNavigationItemProps[] = [
	{
		kind: 'Library',
		icon: <Icons.Globe />,
		title: 'Platforms',
		href: '/platforms',
	},
	{
		kind: 'Import',
		title: 'Download',
		icon: <Icons.Download />,
		href: '/download/bdfr',
	},
];

export const IndexPage: React.FC = () => {
	const { user } = useUser();
	if (user === null) {
		return <Navigate to={'/login'} />;
	}

	return (
		<HomeNavigationItemGrid title="Go to...">
			{items.map((item, key) => (
				<HomeNavigationItem {...item} key={key} />
			))}
		</HomeNavigationItemGrid>
	);
};
