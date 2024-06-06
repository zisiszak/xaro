import {
	Outlet,
	Route,
	ScrollRestoration,
	createBrowserRouter,
	createRoutesFromElements,
} from 'react-router-dom';
import { Navbar } from '../components/navbar/navbar';
import { IndexPage } from '../pages';
import { LoginPage } from '../pages/login';
import { AddPlatformPage } from '../pages/platform/add-platform';
import { RegisterPage } from '../pages/register';
import { ContentRoutes } from './content';
import { DownloadRoutes } from './download';
import { PlatformProfilesRoutes } from './platform-profiles';
import { PlatformsRoutes } from './platforms';
import { UploadRoutes } from './upload';

export const router: ReturnType<typeof createBrowserRouter> =
	createBrowserRouter(
		createRoutesFromElements(
			<>
				<Route
					path="/"
					element={
						<>
							<Navbar />
							<ScrollRestoration />
							<Outlet />
						</>
					}
				>
					<Route index element={<IndexPage />} />
					{PlatformsRoutes}
					{PlatformProfilesRoutes}
					{ContentRoutes}
					{DownloadRoutes}
					{UploadRoutes}
				</Route>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/add-platform" element={<AddPlatformPage />} />
			</>,
		),
	);
