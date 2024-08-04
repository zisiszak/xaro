import { Router } from 'express';
import { GetUserInfoController } from '../controllers/get-user-info.js';
import { LoginUserController } from '../controllers/login-user.js';
import { LogoutUserController } from '../controllers/logout-user.js';
import { RegisterUserController } from '../controllers/register-user.js';
import { RequireUserAccessToken } from '../middleware/require-user-access-token.js';

const router = Router();

router.post('/user/register', RegisterUserController);
router.post('/user/login', LoginUserController);
router.post('/user/logout', LogoutUserController);
router.get('/user/info', RequireUserAccessToken, GetUserInfoController);
