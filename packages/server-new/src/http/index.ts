import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import { type Server } from 'http';
import { xaro } from '~/index.js';
import { UserAccessTokenMiddleware } from './middleware/user-access-token.js';
import { apiRouter } from './routes/index.js';

export const startHttpServer = (): {
	expressApp: Express;
	httpServer: Server;
} => {
	const expressApp = express();
	expressApp.use(express.json());
	expressApp.use(cookieParser());

	expressApp.use('/api', apiRouter);

	expressApp.use('/static.content', UserAccessTokenMiddleware);

	const port = parseInt(process.env.HTTP_PORT);
	const host = process.env.HTTP_HOSTNAME;

	const httpServer = expressApp.listen(port, host, () => {
		xaro.log.info(`HTTP server listening on ${host}:${port}.`);
	});

	return {
		httpServer,
		expressApp,
	};
};
