import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import { xaro } from '~/index.js';

export function startHttpServer() {
	const httpServerConfig = xaro.config.httpServer;

	const expressApp = express();
	expressApp.use(express.json());
	expressApp.use(cookieParser());

	expressApp.use('/api');

	expressApp.use('/static.content');

	const httpServer = expressApp.listen(httpServerConfig.port, httpServerConfig.host, () => {
		xaro.log.info(
			`HTTP server listening on ${httpServerConfig.host}:${httpServerConfig.port}.`,
		);
	});

	return {
		httpServer,
		expressApp: expressApp as Express,
	};
}
