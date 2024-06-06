import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { type Server } from 'http';
import path from 'path';
import { AuthorizeContentAccessMiddleware } from './api/content/middleware_AuthorizeContentAccess.js';
import { apiRouter } from './api/index.js';
import { AuthorizePlatformAccessMiddleware } from './api/platform/middleware_AuthorizePlatformAccess.js';
import { AuthorizeUserAccessTokenMiddleware } from './api/user/middleware_AuthorizeUserAccessToken.js';
import { type ServerConfig } from './config/index.js';
import { db, logger } from './index.js';
import { type Plugin } from './plugins/index.js';
import { loadPlugin, type LoadedModuleType } from './plugins/loader.js';

const CLIENT_FILE_REGEXP =
	/(.ico|.js|.css|.png|.jpg|.svg|.woff2|.woff|.ttf|.eot)$/i;
const ignorePaths = [
	'/api',
	'/static.media',
	'/static.get',
	'/static.asset',
] as const;

export const startApp = async (config: ServerConfig, ...plugins: Plugin[]) => {
	const app = express();
	app.use(express.json());
	app.use(cookieParser());

	const clientIndex = path.join(config.clientBuildDir, 'index.html');
	app.use((req, res, next) => {
		if (
			CLIENT_FILE_REGEXP.test(req.path) ||
			ignorePaths.some((path) => req.path.startsWith(path))
		) {
			req.forwarded = {
				platform: null,
				content: null,
				plugin: null,
				static: null,
				user: null,
			};
			next();
			return;
		}

		res.header(
			'Cache-Control',
			'private, no-cache, no-store, must-revalidate',
		)
			.header('Expires', '-1')
			.header('Pragma', 'no-cache')
			.sendFile(clientIndex, {
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
	});

	// const pluginsRouter = Router();

	const modulesRequiringLinking: LoadedModuleType[] = [];
	await Promise.all(
		plugins.map(async (plugin) =>
			loadPlugin(plugin, { database: db }).then(({ loadedModules }) => {
				loadedModules.forEach((module) => {
					if (module.linkReferences) {
						modulesRequiringLinking.push(module);
					}
				});
			}),
		),
	);
	modulesRequiringLinking.forEach(({ linkReferences, module }) => {
		// typescript shit itself
		linkReferences!(module as never);
	});

	app.use('/api', apiRouter);

	app.use(
		'/static.media',
		AuthorizeUserAccessTokenMiddleware,
		AuthorizeContentAccessMiddleware,
		express.static(config.mediaDir, {
			cacheControl: true,
			fallthrough: false,
			index: false,
			setHeaders: (res) => {
				res.setHeader('Cache-Control', 'public, max-age=31536000');
			},
		}),
	);
	app.use(
		[
			'/static.get/platform/:platformName/:assetFolder/:filename.:extension',
			'/static.get/platform/:platformName/:assetFolder/:subFolder/:filename.:extension',
		],
		(req, res) => {
			// redirects to an asset file path relative to the platform's directory
			res.redirect(
				`/static.asset/platform/${req.params.platformName}/assets/${req.params.assetFolder}${req.params.subFolder ? `/${req.params.subFolder}` : ''}/${req.params.filename}.${req.params.extension}`,
			);
		},
	);
	app.use(
		'/static.asset/platform',
		AuthorizeUserAccessTokenMiddleware,
		AuthorizePlatformAccessMiddleware,
		express.static(config.platformsDir, {
			index: false,
		}),
	);
	app.use(
		express.static(config.clientBuildDir, {
			acceptRanges: true,
		}),
	);

	const server = app.listen(config.port, config.host, () => {
		logger.info(
			{
				port: config.port,
				host: config.host,
			},
			'Server started using config',
		);
	});

	return {
		// ugh, typescript
		Express: app as Express,
		server,
		close() {
			server.close();
		},
		async restart() {
			this.server = await new Promise<Server>((resolve) => {
				server.close(() => {
					const newServer = app.listen(
						config.port,
						config.host,
						() => {
							logger.info(
								{
									port: config.port,
									host: config.host,
								},
								'Server restarted using config',
							);
						},
					);
					resolve(newServer);
				});
			});
		},
		get address() {
			return server.address();
		},
		get port() {
			return config.port;
		},
		get host() {
			return config.host;
		},
		get url() {
			return `http://${config.host}:${config.port}`;
		},
		dirs: {
			get clientBuildDir() {
				return config.clientBuildDir;
			},
			get mediaDir() {
				return config.mediaDir;
			},
			get platformsDir() {
				return config.platformsDir;
			},
			get libraryDir() {
				return config.libraryDir;
			},
			get awaitingImportDir() {
				return config.awaitingImportDir;
			},
			get logDir() {
				return config.logDir;
			},
		},
	};
};
