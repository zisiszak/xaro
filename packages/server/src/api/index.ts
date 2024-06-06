import { Router } from 'express';
import { contentRouter } from './content/routes.js';
import { platformRouter } from './platform/routes.js';
import { userRouter } from './user/routes.js';

const router = Router();

router.use('/user', userRouter);
router.use('/content', contentRouter);
router.use('/platform', platformRouter);

export const apiRouter = router as Router;
