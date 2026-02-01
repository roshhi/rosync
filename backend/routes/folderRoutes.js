import { Router } from 'express';
import { authMiddleware } from '../controller/authController.js';
import {
  createFolder,
  getFolders,
  getFolder,
  renameFolder,
  deleteFolder
} from '../controller/folderController.js';

const router = Router();

// All folder routes require authentication
router.post('/folders', authMiddleware, createFolder);
router.get('/folders', authMiddleware, getFolders);
router.get('/folders/:id', authMiddleware, getFolder);
router.put('/folders/:id', authMiddleware, renameFolder);
router.delete('/folders/:id', authMiddleware, deleteFolder);

export default router;
