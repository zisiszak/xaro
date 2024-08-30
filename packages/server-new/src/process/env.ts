import { homedir } from 'os';
import { join } from 'path';

export * from './config.args.js';
export * from './config.file.js';

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

export const setDefaultEnv = () => {
	process.env.ROOT_DIRECTORY = join(homedir(), 'xaro');
	process.env.HTTP_HOSTNAME = 'localhost';
	process.env.HTTP_PORT = '5173';
	process.env.JWT_SECRET = 'CXZNOREOP10045JCN9NFAKL94NVO5NT8FRNNNR90RNFVCOSN';
};

const requiredEnvVariableErrorMessage = (variable: string) =>
	`Required environment variable ${variable} is not defined.`;

export const validateEnv = (): void | never => {
	if (!process.env.ROOT_DIRECTORY) throw requiredEnvVariableErrorMessage('ROOT_DIRECTORY');
	if (!process.env.JWT_SECRET) throw requiredEnvVariableErrorMessage('JWT_SECRET');
	if (!process.env.HTTP_HOSTNAME) throw requiredEnvVariableErrorMessage('HTTP_HOSTNAME');
	if (!process.env.HTTP_PORT) throw requiredEnvVariableErrorMessage('HTTP_PORT');
};
