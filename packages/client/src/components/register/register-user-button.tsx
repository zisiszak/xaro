export interface RegisterUserButtonProps {
	onClick: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
		username: string | null;
		password: string | null;
		passwordConfirmation: string | null;
	};
	ButtonComponent: React.ComponentType<
		React.InputHTMLAttributes<HTMLInputElement>
	>;
	value: string;
	onRegistered: (username: string) => void;
};
export const RegisterUserButton: React.FC<RegisterUserButtonProps> = ({
	onClick,
	onRegistered,
	ButtonComponent,
	value,
}) => {
	const handleClick = async (
		e: React.MouseEvent<HTMLInputElement, MouseEvent>,
	) => {
		const { username, password, passwordConfirmation } = onClick(e);
		if (username === null || username === '') {
			console.error("No username provided");
			return;
		}
		if (
			password !== passwordConfirmation ||
			(password === null && passwordConfirmation !== '') ||
			(passwordConfirmation === null && password !== '')
		) {
			console.error("Passwords do not match");
			return ;
		}

		const usr = username;
		const pwd = password ?? '';
		const result = await fetch('/api/user/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(`${usr}:${pwd}`)}`,
			},
		})
			.then(async (response) => {
				if (response.status !== 201) {
					console.error({
						message: "Failed to create account.",
						context: {
							responseStatus: response.status,
							text: await response.text()
						}
				});
				return null;
				}

				onRegistered(usr);
			})
			.catch((err) =>
				{
					console.error({
						context: {
							err,
						}
					})
				}
			);
	};

	return (
		<ButtonComponent value={value} type="button" onClick={handleClick} />
	);
};
