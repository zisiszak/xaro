import { RouterProvider } from 'react-router-dom';
import { UserContextProvider } from './model/context/user';
import { ViewPreferencesContextProvider } from './model/context/view-preferences';
import { router } from './routes';
import { GlobalStyles } from './styleguide/global';

function App() {
	return (
		<>
			<GlobalStyles />
			<UserContextProvider>
				<ViewPreferencesContextProvider>
					<RouterProvider router={router} />
				</ViewPreferencesContextProvider>
			</UserContextProvider>
		</>
	);
}

export default App;
