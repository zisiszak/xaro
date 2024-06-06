import path from 'path';
import { readFilteredFilenames, trueBasename } from './index.js';

export const _descriptionFileSuffix = '.description';
export const _thumbnailFileSuffix = '.png';
export const _infoFileSuffix = '.info.json';

// todo: move this
export const getMatchingFiles = async (downloadedMediaPath: string) => {
	const basename = trueBasename(downloadedMediaPath);
	const dir = path.dirname(downloadedMediaPath);

	const matchingFiles = {
		basename,
	} as {
		basename: string;
		description?: string;
		thumbnail?: string;
		info?: string;
	};

	await readFilteredFilenames(dir, (filename) =>
		filename.startsWith(basename),
	).then((files) =>
		files === null
			? null
			: files.forEach((file) => {
					if (file.endsWith(_descriptionFileSuffix)) {
						matchingFiles.description = path.join(dir, file);
					} else if (file.endsWith(_thumbnailFileSuffix)) {
						matchingFiles.thumbnail = path.join(dir, file);
					} else if (file.endsWith(_infoFileSuffix)) {
						matchingFiles.info = path.join(dir, file);
					}
				}),
	);

	return matchingFiles;
};
