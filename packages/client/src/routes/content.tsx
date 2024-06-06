import { Route } from 'react-router-dom';
import { ContentIndexPage } from '../pages/content-index';

export const ContentRoutes = (
	<Route path="content">
		<Route index element={<ContentIndexPage />} />
	</Route>
);
