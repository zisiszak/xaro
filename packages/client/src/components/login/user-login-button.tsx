import React from 'react';

export type UserLoginButtonProps = {
	onClick: (e: React.MouseEvent<HTMLInputElement>) => {
		username: string | null;
		password: string | null;
	};
	ButtonComponent: React.ComponentType<
		React.InputHTMLAttributes<HTMLInputElement>
	>;
	value: string;
	fetchUserData: () => Promise<void>;
};
export const UserLoginButton: React.FC<UserLoginButtonProps> = ({
	onClick,
	ButtonComponent,
	fetchUserData,
	value,
}) => {
	const handleClick = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
		const { username, password } = onClick(e);
		if (username === null || username === '') {
			console.error("No username provided");
			return;
		}

		fetch('/api/user/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(`${username}:${password}`)}`,
			},
		})
			.then(async (response) => {
				if (response.status !== 200) {
					console.error({
						message: "Failed to login",
						context: {
							resJson: await response.json(),
						}
					})
					return;
				}
				return fetchUserData();
			})
			.catch((err) =>
				console.error(err)
			);
	};

	return (
		<ButtonComponent value={value} type="button" onClick={handleClick} />
	);
};
