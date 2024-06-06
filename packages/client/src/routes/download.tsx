import { Route } from 'react-router-dom';
import { BdfrDownloadPage } from '../pages/bdfr-download';
import { YtdlpDownloadPage } from '../pages/ytdlp-download';

export const DownloadRoutes = (
	<Route path="download">
		<Route path="bdfr">
			<Route index element={<BdfrDownloadPage />} />
			<Route path="subreddit" element={<BdfrDownloadPage />} />
		</Route>
		<Route path="yt-dlp/:platform" element={<YtdlpDownloadPage />} />
	</Route>
);
