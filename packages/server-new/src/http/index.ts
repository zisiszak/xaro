import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import { type Server } from 'http';
import { logger } from '~/index.js';
import { userAccessTokenMiddleware } from '../modules/users/middleware/user-access-token.middleware.js';
import { MediaAccessMiddleware } from './middleware/media-access.js';
import { apiRouter } from './routes/index.js';

export const startHttpServer = (): {
	expressApp: Express;
	httpServer: Server;
} => {
	const expressApp = express();
	expressApp.use(express.json());
	expressApp.use(cookieParser());

	expressApp.use('/api', apiRouter);

	expressApp.use('/static.media', userAccessTokenMiddleware, MediaAccessMiddleware);

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
