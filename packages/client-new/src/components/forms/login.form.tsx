import { useState } from 'react';
import { User, useUser } from '../../model/context/user';
import { api } from '../../server-api';
import { basicHttpAuthentication } from '../../server-api/basic-http-authentication';
import {
	Description,
	FieldContainer,
	FieldLabel,
	Form,
	InvalidTextInputMessage,
	PasswordInput,
	StatusContainer,
	StatusDescription,
	StatusHeading,
	SubmitButton,
	TextInput,
	Title,
} from '../../styleguide/form.primitives';

export const LoginForm = () => {
	const { user, setUser } = useUser();

	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string | null>(null);
	const [status, setStatus] = useState<
		'INVALID_USERNAME' | 'LOADING' | 'INVALID_CREDENTIALS' | 'SERVER_ERROR' | null
	>(null);

	if (user !== null) return null;

	const handleSubmit = (e: React.MouseEvent) => {
		e.preventDefault();
		if (status !== null) return;

		setStatus('LOADING');

		api.POST('/user/login', {
			headers: {
				...basicHttpAuthentication(username, password),
			},
		}).then(({ data, response }) => {
			if (data) {
				setStatus(null);
				setUser(data as User);
				return;
			}

			switch (response.status) {
				case 401:
					return void setStatus('INVALID_CREDENTIALS');
				case 400:
					return void setStatus('INVALID_USERNAME');
				default:
					return void setStatus('SERVER_ERROR');
			}
		});
	};

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const username = e.target.value;

		setUsername(username);

		if (username === '') {
			setStatus('INVALID_USERNAME');
		} else if (status === 'INVALID_USERNAME' || status === 'INVALID_CREDENTIALS') {
			setStatus(null);
		}
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.target.value === '' ? setPassword(null) : setPassword(e.target.value);
		if (status === 'INVALID_CREDENTIALS') setStatus(null);
	};

	return (
		<Form id="login-form" name="login-form">
			<Title>Login</Title>
			<Description>
				Login to your account... or don't. I'm not your boss. I can't tell you what to do.
				I'm just a form. I don't even have a brain. I'm just a bunch of pixels on a screen.
				I am nothing. I am meaningless. I am form.
			</Description>
			<FieldContainer
				$invalidInput={status === 'INVALID_USERNAME' || status === 'INVALID_CREDENTIALS'}
			>
				<FieldLabel htmlFor="username-input">Username</FieldLabel>
				<TextInput
					id="username-input"
					required
					$invalidInput={
						status === 'INVALID_USERNAME' || status === 'INVALID_CREDENTIALS'
					}
					placeholder="Username"
					onChange={handleUsernameChange}
				/>
				{status === 'INVALID_USERNAME' && (
					<InvalidTextInputMessage>Username is required.</InvalidTextInputMessage>
				)}
			</FieldContainer>
			<FieldContainer $invalidInput={status === 'INVALID_CREDENTIALS'}>
				<FieldLabel htmlFor="password-input">Password</FieldLabel>
				<PasswordInput
					id="password-input"
					type="password"
					$invalidInput={status === 'INVALID_CREDENTIALS'}
					onChange={handlePasswordChange}
					placeholder="Password"
				/>
			</FieldContainer>
			{status === 'INVALID_CREDENTIALS' && (
				<StatusContainer>
					<StatusHeading>Invalid Credentials</StatusHeading>
					<StatusDescription>
						Username and password combination is not recognised.
					</StatusDescription>
				</StatusContainer>
			)}
			{status === 'SERVER_ERROR' && (
				<StatusContainer>
					<StatusHeading $status="error">Server Error</StatusHeading>
					<StatusDescription>
						An unexpected error occurred. Check the logs for more details.
					</StatusDescription>
				</StatusContainer>
			)}
			{status === 'LOADING' && (
				<StatusContainer>
					<StatusHeading>Loading...</StatusHeading>
				</StatusContainer>
			)}
			<SubmitButton onClick={handleSubmit} disabled={status !== null}>
				Login
			</SubmitButton>
		</Form>
	);
};
