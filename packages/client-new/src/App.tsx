import { LoginForm } from './components/forms/login.form';
import { Navbar } from './components/navbar';
import { UserContextProvider } from './model/context/user';
import { GlobalStyle } from './styleguide';

function App() {
	return (
		<>
			<GlobalStyle />
			<UserContextProvider>
				<Navbar />
				<LoginForm />
			</UserContextProvider>
		</>
	);
}

export default App;
