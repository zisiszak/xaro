import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import { type Server } from 'http';
import { logger } from '~/index.js';
import { apiRouter } from './routes/api.js';
import { createStaticRouter } from './routes/static.js';

export const startHttpServer = (): {
	expressApp: Express;
	httpServer: Server;
} => {
	const expressApp = express();
	expressApp.use(express.json());
	expressApp.use(cookieParser());

	expressApp.use('/api', apiRouter);
	const staticRouter = createStaticRouter();
	expressApp.use('/static', staticRouter);

	const port = parseInt(process.env.HTTP_PORT);
	const host = process.env.HTTP_HOSTNAME;

	const httpServer = expressApp.listen(port, host, () => {
		logger.info(`HTTP server listening on ${host}:${port}.`);
	});

	return {
		httpServer,
		expressApp,
	};
};
