import { ServerAPI } from '@xaro/server';
import { useState } from 'react';
import { Primitive } from '../../styleguide';
import { FormPrimitive } from '../../styleguide/components';

interface Fields {
	addFromUrl?: string;
}

export const AddPlatformPage: React.FC = () => {
	const [fields, setFields] = useState<Fields>({});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [success, setSuccess] =
		useState<ServerAPI.AddPlatform.Success | null>(null);
	const updateFields = (update: Partial<Fields>) =>
		setFields((prev) => ({ ...prev, ...update }));

	return (
		<Primitive.Section.Standard>
			<Primitive.Container.MD>
				<FormPrimitive.Form>
					<FormPrimitive.Title>Add Platform</FormPrimitive.Title>
					<FormPrimitive.ItemsContainer>
						<FormPrimitive.item.Container>
							<FormPrimitive.item.Label>
								Add automatically using a URL
							</FormPrimitive.item.Label>
							<FormPrimitive.item.Text
								required
								onChange={(e) => {
									const input = e.currentTarget.value;

									try {
										new URL(input);
									} catch (err) {
										setErrorMessage(
											'Invalid URL provided.',
										);
										return;
									}

									setErrorMessage(null);
									updateFields({
										addFromUrl: input,
									});
								}}
								placeholder="Enter a URL that is associated with the platform."
							/>
						</FormPrimitive.item.Container>
					</FormPrimitive.ItemsContainer>
					<FormPrimitive.buttons.Submit
						value={'Add Platform'}
						onClick={(e) => {
							e.preventDefault();
							if (errorMessage || isLoading) {
								return;
							}

							if (!fields.addFromUrl) {
								setErrorMessage(`Missing fields!`);
								return;
							}

							setIsLoading(true);
							fetch('/api/platform/add', {
								method: 'POST',
								body: JSON.stringify({
									addFromUrl: fields.addFromUrl,
								} satisfies ServerAPI.AddPlatform.AutoAddBody),
								headers: {
									'Content-type': 'application/json',
								},
							})
								.then((res) => {
									if (res.status !== 200) {
										setErrorMessage(
											`Failed to add platform. Server response status: ${res.status} (${res.statusText})`,
										);
										setIsLoading(false);
										return null;
									}

									return res.json() as Promise<ServerAPI.AddPlatform.Success>;
								})
								.then((data) => {
									if (!data) {
										return;
									}
									setIsLoading(false);
									setSuccess(data);
									if (!data.userIsLinked) {
										setErrorMessage(
											'Failed to link user account to platform.',
										);
									}
								});
						}}
					/>
					{errorMessage && (
						<FormPrimitive.statusMessage.Error>
							{errorMessage}
						</FormPrimitive.statusMessage.Error>
					)}
					{success && (
						<FormPrimitive.statusMessage.Success>
							{success.created
								? `New platform "${success.platformName}" added with ID: ${success.platformId}.`
								: `Existing platform ${success.platformName} found with ID: ${success.platformId}.`}
							{'\n'}
							{success.userIsLinked
								? `User is linked to platform.`
								: ''}
						</FormPrimitive.statusMessage.Success>
					)}
				</FormPrimitive.Form>
			</Primitive.Container.MD>
		</Primitive.Section.Standard>
	);
};
