import { Route } from 'react-router-dom';
import { PlatformAllMediaPage } from '../pages/all-media/all-platform-media';
import { PlatformPage } from '../pages/platform/platform';
import { PlatformsIndexPage } from '../pages/platform/platforms-index';

export const PlatformsRoutes = (
	<Route path="platforms">
		<Route index element={<PlatformsIndexPage />} />
		<Route caseSensitive path=":platform">
			<Route index element={<PlatformPage />} />
			<Route path="all" element={<PlatformAllMediaPage />} />
		</Route>
	</Route>
);
