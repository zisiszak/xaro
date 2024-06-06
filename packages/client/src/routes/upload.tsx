import { Route } from 'react-router-dom';
import { UploadMediaPage } from '../pages/_upload-media';

export const UploadRoutes = (
	<Route path="upload">
		<Route index element={<UploadMediaPage />} />
	</Route>
);
