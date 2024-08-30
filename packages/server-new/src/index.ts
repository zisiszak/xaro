import { startHttpServer } from './http/index.js';
import { defaultFileFormats } from './modules/files/index.js';
import { fileFormatRepository } from './modules/files/repositories/file-format.repository.js';
import { init, type XaroProcess } from './process/index.js';

// 1. Init
export const xaro: XaroProcess = await init();
await fileFormatRepository.saveOrUpdate(defaultFileFormats);

// 2. Load plugins

// 3. Start listening
export const server = startHttpServer();
