import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { prisma } from '../lib/prisma.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Upload a file
export const uploadFile = async (req, res) => {
  try {
    const { folderId } = req.body;
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Verify folder exists and belongs to user (if folderId provided)
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: parseInt(folderId),
          userId
        }
      });

      if (!folder) {
        return res.status(404).json({
          success: false,
          error: 'Folder not found'
        });
      }
    }

    // Check storage quota (100 MB limit)
    const STORAGE_LIMIT = 100 * 1024 * 1024; // 100 MB in bytes
    
    // Calculate current storage usage
    const userFiles = await prisma.file.findMany({
      where: { userId },
      select: { size: true }
    });
    
    const currentUsage = userFiles.reduce((total, file) => total + file.size, 0);
    const newUsage = currentUsage + req.file.size;
    
    if (newUsage > STORAGE_LIMIT) {
      return res.status(400).json({
        success: false,
        error: `Storage quota exceeded. You have used ${(currentUsage / 1024 / 1024).toFixed(2)} MB of 100 MB. This file would exceed your limit.`
      });
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `file-uploader/${userId}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const cloudinaryResult = await uploadPromise;
    console.log('Cloudinary upload result:', cloudinaryResult);

    // Save file metadata to database
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        publicId: cloudinaryResult.public_id,
        resourceType: cloudinaryResult.resource_type,
        url: cloudinaryResult.secure_url,
        folderId: folderId ? parseInt(folderId) : null,
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get all files for authenticated user
export const getFiles = async (req, res) => {
  try {
    const userId = req.userId;
    const { folderId } = req.query;

    const where = { userId };
    
    if (folderId && folderId !== 'root') {
      where.folderId = parseInt(folderId);
    } else if (folderId === 'root' || !folderId) {
      where.folderId = null;
    }

    const files = await prisma.file.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get specific file by ID
export const getFileById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      file
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a file
export const deleteFile = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Verify file exists and belongs to user
    const file = await prisma.file.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Try to delete from Cloudinary (don't fail if this errors)
    try {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.resourceType
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error (continuing):', cloudinaryError);
    }

    // Delete from database
    await prisma.file.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get storage statistics for user
export const getStorageStats = async (req, res) => {
  try {
    const userId = req.userId;
    const STORAGE_LIMIT = 100 * 1024 * 1024; // 100 MB in bytes

    // Get all user files
    const userFiles = await prisma.file.findMany({
      where: { userId },
      select: { size: true }
    });

    const totalUsed = userFiles.reduce((total, file) => total + file.size, 0);
    const percentageUsed = (totalUsed / STORAGE_LIMIT) * 100;

    res.json({
      success: true,
      storage: {
        used: totalUsed,
        limit: STORAGE_LIMIT,
        usedMB: (totalUsed / 1024 / 1024).toFixed(2),
        limitMB: 100,
        percentageUsed: percentageUsed.toFixed(2),
        remaining: STORAGE_LIMIT - totalUsed,
        remainingMB: ((STORAGE_LIMIT - totalUsed) / 1024 / 1024).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching storage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
