import { startHttpServer } from './process/http-server.js';
import { initProcess, type XaroProcess } from './process/index.js';

// 1. Init
export const xaro: XaroProcess = await initProcess();

// 2. Load plugins

// 3. Start listening
const { httpServer, expressApp } = startHttpServer();
