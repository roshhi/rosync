import { Router } from 'express';
import { authMiddleware } from '../controller/authController.js';
import {
  upload,
  uploadFile,
  getFiles,
  getFileById,
  deleteFile,
  getStorageStats
} from '../controller/fileController.js';

const router = Router();

// All file routes require authentication
router.post('/files/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/files', authMiddleware, getFiles);
router.get('/files/:id', authMiddleware, getFileById);
router.delete('/files/:id', authMiddleware, deleteFile);
router.get('/storage/stats', authMiddleware, getStorageStats);

export default router;
