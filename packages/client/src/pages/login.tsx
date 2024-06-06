import { LoginForm } from '../components/login/user-login-form';
import { Primitive } from '../styleguide';

export const LoginPage: React.FC = () => {
	return (
		<Primitive.Section.Standard>
			<Primitive.Container.SM>
				<LoginForm />
			</Primitive.Container.SM>
		</Primitive.Section.Standard>
	);
};
