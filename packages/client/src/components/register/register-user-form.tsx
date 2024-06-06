import { useRef, useState } from 'react';
import { FormPrimitive } from '../../styleguide/components/index.js';
import { RegisterUserButton } from './register-user-button.js';

export const RegisterUserForm: React.FC = () => {
	const passwordRef = useRef<HTMLInputElement>(null);
	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordConfirmationRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<null | false>(null);

	return (
		<FormPrimitive.Form>
			<FormPrimitive.navigation.Container>
				Already have an account?{' '}
				<FormPrimitive.navigation.Link href="/login">
					Login!
				</FormPrimitive.navigation.Link>
			</FormPrimitive.navigation.Container>
			<FormPrimitive.Title>Create Profile</FormPrimitive.Title>
			<FormPrimitive.Description>
				Create a profile... or don't. I'm not your boss. I can't tell
				you what to do. I'm just a form. I don't even have a brain. I'm
				just a bunch of pixels on a screen. I am nothing. I am
				meaningless. I am form.
			</FormPrimitive.Description>
			<FormPrimitive.ItemsContainer>
				<FormPrimitive.item.Container>
					<FormPrimitive.item.Label htmlFor="create-account-form-username">
						Username
					</FormPrimitive.item.Label>
					<FormPrimitive.item.Text
						id="create-account-form-username"
						aria-label="Username"
						placeholder="Username"
						ref={usernameRef}
					/>
				</FormPrimitive.item.Container>
				<FormPrimitive.item.Container>
					<FormPrimitive.item.Label htmlFor="create-account-form-password">
						Password
					</FormPrimitive.item.Label>
					<FormPrimitive.item.Password
						id="create-account-form-password"
						ref={passwordRef}
						aria-label="Password"
						placeholder="Password"
					/>
				</FormPrimitive.item.Container>
				<FormPrimitive.item.Container>
					<FormPrimitive.item.Label htmlFor="create-account-form-password-confirm">
						Confirm Password
					</FormPrimitive.item.Label>
					<FormPrimitive.item.Password
						id="create-account-form-password-confirm"
						ref={passwordConfirmationRef}
						aria-label="Confirm Password"
						placeholder="Confirm Password"
					/>
				</FormPrimitive.item.Container>
			</FormPrimitive.ItemsContainer>
			<RegisterUserButton
				onClick={(e) => {
					e.preventDefault();
					return {
						username: usernameRef.current?.value ?? null,
						password: passwordRef.current?.value ?? null,
						passwordConfirmation:
							passwordConfirmationRef.current?.value ?? null,
					};
				}}
				value="Create Account"
				onRegistered={(username) => {
					setError(false);
					setTimeout(() => {
						window.location.href = `/login?username=${username}`;
					}, 400);
				}}
				ButtonComponent={FormPrimitive.buttons.Submit}
			/>
			{error !== null && error !== false ? (
				<FormPrimitive.statusMessage.Error>
					{"There is meant to be an error here but I can't be bothered coding it so here's an unnecessarily long sentence explaining the absence of an error."}
				</FormPrimitive.statusMessage.Error>
			) : null}
			{error === false && (
				<FormPrimitive.statusMessage.Success>
					Profile created successfully!
				</FormPrimitive.statusMessage.Success>
			)}
		</FormPrimitive.Form>
	);
};
