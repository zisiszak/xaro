import { type RequestHandler } from 'express';
import { parseBasicAuthHeader } from '~/utils/index.js';

export const RequireBasicAuth: RequestHandler = (req, res, next) => {
	const auth = parseBasicAuthHeader(req.headers);

	if (auth === null) {
		res.status(400).end();
		return;
	} else if (typeof auth === 'undefined') {
		res.status(401).end();
		return;
	}

	req.basicAuth = auth;

	next();
};
