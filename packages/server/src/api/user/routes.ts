import { Router } from 'express';
import { GetAboutUserController } from './controller_GetAboutUser.js';
import { LoginUserController } from './controller_LoginUser.js';
import { LogoutUserController } from './controller_LogoutUser.js';
import { RegisterUserController } from './controller_RegisterUser.js';
import { AuthorizeUserAccessTokenMiddleware } from './middleware_AuthorizeUserAccessToken.js';

const router = Router();

router.post('/register', RegisterUserController);
router.post('/login', LoginUserController);
router.post('/logout', LogoutUserController);

router.all('*', AuthorizeUserAccessTokenMiddleware);

router.get('/about', GetAboutUserController);

export const userRouter = router as Router;
