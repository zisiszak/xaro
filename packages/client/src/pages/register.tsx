import { RegisterUserForm } from '../components/register/register-user-form.js';
import { Primitive } from '../styleguide/index.js';

export const RegisterPage: React.FC = () => {
	return (
		<Primitive.Section.Standard>
			<Primitive.Container.SM>
				<RegisterUserForm />
			</Primitive.Container.SM>
		</Primitive.Section.Standard>
	);
};
