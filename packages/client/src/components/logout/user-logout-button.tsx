export type UserLogoutButtonProps = {
	ButtonComponent: React.ComponentType<
		React.InputHTMLAttributes<HTMLInputElement>
	>;
	onClick?: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
	value: string;
	onLogout?: () => void;
};

export const UserLogoutButton: React.FC<UserLogoutButtonProps> = ({
	ButtonComponent,
	onClick,
	value,
	onLogout,
}) => {
	const handleClick = async (
		e: React.MouseEvent<HTMLInputElement, MouseEvent>,
	) => {
		if (onClick) onClick(e);
		return fetch('/api/user/logout', {
			method: 'POST',
		}).then(async (response) => {
			if (response.status !== 205) {
				console.error(`Failed to logout: Status ${response.status}`);
				return null;
			}
			onLogout && onLogout();
		});
	};

	return (
		<ButtonComponent value={value} type="button" onClick={handleClick} />
	);
};
