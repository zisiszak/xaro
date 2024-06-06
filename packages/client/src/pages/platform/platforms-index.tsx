import { type ServerAPI } from '@xaro/server';
import { useState } from 'react';
import { PlatformTile } from '../../components/platform/tile/tile.js';
import { loadLinkedPlatforms } from '../../model/loaders/platform/load-linked-platforms.js';
import {
	FormPrimitive,
	HeaderPrimitive,
} from '../../styleguide/components/index.js';
import * as S from './platforms-index.styles.js';

export const PlatformsIndexPage: React.FC = () => {
	const [platforms, setPlatforms] =
		useState<ServerAPI.GetAllPlatforms.Success | null>(null);
	loadLinkedPlatforms({ setPlatforms });

	const [platformAddByUrl, setPlatformAddByUrl] = useState<string>('');

	if (platforms === null) {
		return null;
	}

	return (
		<>
			<HeaderPrimitive.Header>
				<HeaderPrimitive.detailsAndButtons.Wrap>
					<HeaderPrimitive.detailsAndButtons.DetailsWrap>
						<HeaderPrimitive.detailsAndButtons.Title>
							Platforms
						</HeaderPrimitive.detailsAndButtons.Title>
						<HeaderPrimitive.detailsAndButtons.Description>
							A list of all platforms
						</HeaderPrimitive.detailsAndButtons.Description>
					</HeaderPrimitive.detailsAndButtons.DetailsWrap>
					<HeaderPrimitive.detailsAndButtons.ButtonsFlex>
						<FormPrimitive.buttons.Submit as="a" href="/">
							Return Home
						</FormPrimitive.buttons.Submit>
					</HeaderPrimitive.detailsAndButtons.ButtonsFlex>
				</HeaderPrimitive.detailsAndButtons.Wrap>
			</HeaderPrimitive.Header>
			<section>
				<FormPrimitive.Fieldset>
					<FormPrimitive.item.Label>
						Add Platform By URL
					</FormPrimitive.item.Label>
					<FormPrimitive.item.Text
						onChange={(e) =>
							setPlatformAddByUrl(e.currentTarget.value)
						}
						defaultValue={platformAddByUrl}
						placeholder={'Enter URL'}
					/>
				</FormPrimitive.Fieldset>
				<FormPrimitive.buttons.Submit
					onClick={async () => {
						if (!platformAddByUrl) {
							console.warn('No platform URL provided.');
							return;
						}

						console.log('Adding platform');

						await fetch(`/api/platform/add`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								addFromUrl: platformAddByUrl,
							}),
						})
							.then((res) => console.log(res))
							.catch((err) => console.error(err));
					}}
				/>
			</section>
			{platforms && (
				<S.Grid>
					{platforms.map((props) => (
						<PlatformTile key={props.id} {...props} />
					))}
				</S.Grid>
			)}
		</>
	);
};
