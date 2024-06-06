import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormPrimitive } from '../styleguide/components/index.js';

export const YtdlpDownloadPage: React.FC = () => {
	const [urls, setUrls] = useState<string>('');

	const { platform } = useParams<{
		platform: string;
	}>();

	if (!platform) return null;

	return (
		<>
			<FormPrimitive.item.Text
				onChange={(e) => {
					setUrls(e.currentTarget.value);
				}}
				as={'textarea'}
				placeholder="Enter a URL"
			/>
			~
			<FormPrimitive.buttons.Submit
				onClick={(e) => {
					e.preventDefault();
					if (!urls) return;

					const contentSource = urls.split('\n').map((url) => ({
						kind: 'video',
						url: url.trim(),
					}));

					fetch(`/api/platform/extract/content/${platform}`, {
						method: 'POST',
						body: JSON.stringify({
							contentSource,
							contentExtractorType: 'many-to-many',
						}),
						headers: {
							'Content-Type': 'application/json',
						},
					})
						.then(async (res) => {
							if (res.status !== 200) {
								console.error('Failed to download file');
								console.log(await res.text());
								return;
							}
							console.log('Urls queued');
						})
						.catch((err) => console.error(err));
				}}
				value={'Queue'}
			/>
			<FormPrimitive.buttons.Submit
				as={'button'}
				onClick={(e) => {
					e.preventDefault();
					fetch(`/api/platforms/download/start`, {
						method: 'POST',
					}).catch((err) => {
						console.error(err);
					});
				}}
			>
				Download
			</FormPrimitive.buttons.Submit>
		</>
	);
};
