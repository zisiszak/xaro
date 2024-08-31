import { homedir } from 'os';
import { join } from 'path';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		export interface ProcessEnv {
			FFMPEG_PATH?: string;
			FFPROBE_PATH?: string;
			HTTP_HOSTNAME: string;
			HTTP_PORT: `${string}`;
			JWT_SECRET: string;
			ROOT_DIRECTORY: string;
			CONFIG_FILEPATH?: string;
		}
	}
}

export const setDefaultEnvironmentVariables = () => {
	process.env.ROOT_DIRECTORY = join(homedir(), 'xaro');
	process.env.HTTP_HOSTNAME = 'localhost';
	process.env.HTTP_PORT = '5173';
	process.env.JWT_SECRET = 'CXZNOREOP10045JCN9NFAKL94NVO5NT8FRNNNR90RNFVCOSN';
};

const envVarRequiredError = (variable: string): string =>
	`Required environment variable ${variable} is not defined.`;

// TODO: Make this more thorough.
/** Ensures all necessary environment variables are defined. Throws if something is amiss. */
export const validateEnvironmentVariables = async (): Promise<void> => {
	if (!process.env.ROOT_DIRECTORY) throw envVarRequiredError('ROOT_DIRECTORY');
	if (!process.env.JWT_SECRET) throw envVarRequiredError('JWT_SECRET');
	if (!process.env.HTTP_HOSTNAME) throw envVarRequiredError('HTTP_HOSTNAME');
	if (!process.env.HTTP_PORT) throw envVarRequiredError('HTTP_PORT');

	return Promise.resolve();
};
