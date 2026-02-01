import { Router } from 'express';
import { signupController, loginController, logoutController, profileController,authMiddleware } from '../controller/authController.js';

const router = Router();

router.post('/auth/signup', signupController);
router.post('/auth/login', loginController);
router.post('/auth/logout',authMiddleware,logoutController);
router.get('/auth/me',authMiddleware,profileController);

export default router;
