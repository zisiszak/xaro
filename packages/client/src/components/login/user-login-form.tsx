import { is } from 'is-guard';
import queryString from 'query-string';
import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../model/context/user.js';
import { FormPrimitive } from '../../styleguide/components/index.js';
import { UserLoginButton } from './user-login-button.js';

export const LoginForm: React.FC = () => {
	const { user, fetchUserData } = useUser();

	const passwordRef = useRef<HTMLInputElement>(null);
	const usernameRef = useRef<HTMLInputElement>(null);

	// false when logged in successfully
	const [error, setError] = useState<null | false>(null);

	const { referrer: referrerRaw, username: usernameRaw } = queryString.parse(
		window.location.search,
	);
	const referrer =
		(is.array(referrerRaw) ? referrerRaw[0] : referrerRaw) ?? '';
	const username =
		(is.array(usernameRaw) ? usernameRaw[0] : usernameRaw) ?? '';

	if (error === false) {
		setTimeout(() => {
			(window.location.href = `/${referrer}`), 400;
		});
	}
	if (user !== null) {
		return <Navigate to={`/${referrer}`} />;
	}

	return (
		<FormPrimitive.Form>
			<FormPrimitive.navigation.Container>
				No Account?{' '}
				<FormPrimitive.navigation.Link href="/register">
					Create one!
				</FormPrimitive.navigation.Link>
			</FormPrimitive.navigation.Container>
			<FormPrimitive.Title>Login</FormPrimitive.Title>
			<FormPrimitive.Description>
				Login to your account... or don't. I'm not your boss. I can't
				tell you what to do. I'm just a form. I don't even have a brain.
				I'm just a bunch of pixels on a screen. I am nothing. I am
				meaningless. I am form.
			</FormPrimitive.Description>
			<FormPrimitive.ItemsContainer>
				<FormPrimitive.item.Container>
					<FormPrimitive.item.Label htmlFor="login-form-username-input">
						Username
					</FormPrimitive.item.Label>
					<FormPrimitive.item.Text
						id="login-form-username-input"
						aria-label="Username"
						placeholder="Username"
						defaultValue={username ?? undefined}
						ref={usernameRef}
					/>
				</FormPrimitive.item.Container>
				<FormPrimitive.item.Container>
					<FormPrimitive.item.Label htmlFor="login-form-password-input">
						Password
					</FormPrimitive.item.Label>
					<FormPrimitive.item.Password
						id="login-form-password-input"
						ref={passwordRef}
						aria-label="Password"
						placeholder="Password"
					/>
				</FormPrimitive.item.Container>
			</FormPrimitive.ItemsContainer>
			<UserLoginButton
				ButtonComponent={FormPrimitive.buttons.Submit}
				onClick={(e) => {
					e.preventDefault();

					return {
						username: usernameRef.current?.value ?? null,
						password: passwordRef.current?.value ?? null,
					};
				}}
				value="Login"
				fetchUserData={fetchUserData}
			/>
			{error && (
				<FormPrimitive.statusMessage.Error>
					{"There is an error whoops."}
				</FormPrimitive.statusMessage.Error>
			)}
			{error === false && (
				<FormPrimitive.statusMessage.Success>
					Logged in successfully!
				</FormPrimitive.statusMessage.Success>
			)}
		</FormPrimitive.Form>
	);
};
