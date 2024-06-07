import { cleanInt } from '@xaro/utils';
import { newError } from 'exitus';
import { homedir } from 'os';
import path from 'path';
import { readAndParseJSON } from '~/utils/fs/index.js';
import { isConfigurationFile } from './custom.js';

export * from './custom.js';

export interface ServerConfig {
	libraryDir: string;
	port: number;
	host: string;
	clientBuildDir: string;
	mediaDir: string;
	mediaThumbnailsDir: string;
	mediaOriginalsDir: string;
	mediaPreviewsDir: string;
	mediaConvertedDir: string;
	mediaResizedDir: string;
	awaitingImportDir: string;
	platformsDir: string;
	databaseFile: string;
	logDir: string;
}

export type UpdateServerConfigArgs = {
	'--config-file'?: string;
	'--port'?: number;
	'--host'?: string;
	'--library-dir'?: string;
	'--web-client-build-dir'?: string;
	'--ffmpeg-path'?: string;
	'ffprobe-path'?: string;
};
export const updateServerConfig = async (args: UpdateServerConfigArgs) => {
	const customConfig = args['--config-file']
		? await readAndParseJSON(args['--config-file'], isConfigurationFile)
		: null;

	if (typeof process.env.JWT_SECRET !== 'string') {
		console.error('JWT_SECRET environment variable is not defined!');
		process.exit(1);
	}

	const libraryDir =
		args['--library-dir'] ??
		customConfig?.libraryDir ??
		process.env.LIBRARY_DIR ??
		path.join(homedir(), 'zmh');
	const clientBuildDir = args['--web-client-build-dir'] ?? process.env.CLIENT_BUILD_DIR;
	const port = cleanInt(args['--port'] ?? customConfig?.port ?? process.env.PORT ?? 3000);
	const host = args['--host'] ?? customConfig?.host ?? process.env.HOST ?? 'localhost';

	if (!libraryDir || !clientBuildDir || !port || !host) {
		return newError({
			message: 'Missing required configuration values',
			context: { args },
		});
	}

	const ffmpegPath =
		args['--ffmpeg-path'] ?? customConfig?.libs?.ffmpeg?.ffmpegPath ?? process.env.FFMPEG_PATH;
	const ffprobePath =
		args['ffprobe-path'] ?? customConfig?.libs?.ffmpeg?.ffprobePath ?? process.env.FFPROBE_PATH;
	ffmpegPath && (process.env.FFMPEG_PATH = ffmpegPath);
	ffprobePath && (process.env.FFPROBE_PATH = ffprobePath);

	const mediaDir = path.join(libraryDir, 'media');
	const mediaThumbnailsDir = path.join(mediaDir, 'thumbnails');
	const mediaOriginalsDir = path.join(mediaDir, 'originals');
	const mediaPreviewsDir = path.join(mediaDir, 'previews');
	const mediaConvertedDir = path.join(mediaDir, 'converted');
	const mediaResizedDir = path.join(mediaDir, 'resized');
	const awaitingImportDir = path.join(libraryDir, 'awaiting-import');
	const platformsDir = path.join(libraryDir, 'platforms');
	const databaseFile = path.join(libraryDir, 'main.sqlite3');
	const logDir = path.join(libraryDir, 'logs');

	return {
		host,
		port,
		clientBuildDir,
		libraryDir,
		mediaDir,
		mediaThumbnailsDir,
		mediaOriginalsDir,
		mediaPreviewsDir,
		mediaConvertedDir,
		mediaResizedDir,
		awaitingImportDir,
		platformsDir,
		databaseFile,
		logDir,
	} satisfies ServerConfig as ServerConfig;
};
