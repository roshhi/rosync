import { Router } from 'express';
import { authMiddleware } from '../controller/authController.js';
import {
  createShareLink,
  getSharedFolder
} from '../controller/shareController.js';

const router = Router();

// Create share link (requires authentication)
router.post('/share/folder/:id', authMiddleware, createShareLink);

// Get shared folder (public - no auth required)
router.get('/share/:shareId', getSharedFolder);

export default router;