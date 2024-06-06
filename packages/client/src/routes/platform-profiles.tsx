import { Route } from 'react-router-dom';
import { PlatformProfilePage } from '../pages/platform/platform-profile';

export const PlatformProfilesRoutes = (
	<Route path="platform-profiles">
		<Route index />
		<Route path=":profileId" element={<PlatformProfilePage />} />
	</Route>
);
