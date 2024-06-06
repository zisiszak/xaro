import { Primitive } from '../../styleguide';
import * as S from './navbar.styles';
import { UserNavbarStatus } from './user-navbar-status';

export const Navbar: React.FC = () => {
	return (
		<S.Navbar>
			<Primitive.Container.XLL>
				<UserNavbarStatus />
			</Primitive.Container.XLL>
		</S.Navbar>
	);
};
