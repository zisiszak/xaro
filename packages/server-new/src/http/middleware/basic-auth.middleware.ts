import { type RequestHandler } from 'express';
import { parseBasicAuthHeader } from '~/utils/index.js';

export const basicAuthMiddleware: RequestHandler = (req, res, next) => {
	const auth = parseBasicAuthHeader(req.headers);

	if (auth === null) return void res.status(400).end();
	if (typeof auth === 'undefined') return void res.status(401).end();

	req.basicAuth = auth;
	next();
};
