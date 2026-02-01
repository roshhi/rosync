import { prisma } from '../lib/prisma.js';

// Create a new folder
export const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    // If parentId provided, verify it exists and belongs to user
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId
        }
      });

      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          error: 'Parent folder not found'
        });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        userId,
        parentId: parentId || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get all folders for authenticated user
export const getFolders = async (req, res) => {
  try {
    const userId = req.userId;
    const { parentId } = req.query;

    const where = { userId };
    
    // If parentId is provided, get child folders
    // If parentId is 'root' or null, get top-level folders
    if (parentId && parentId !== 'root') {
      where.parentId = parseInt(parentId);
    } else if (parentId === 'root' || !parentId) {
      where.parentId = null;
    }

    const folders = await prisma.folder.findMany({
      where,
      include: {
        _count: {
          select: {
            files: true,
            children: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    res.json({
      success: true,
      folders
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a specific folder by ID
export const getFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const folder = await prisma.folder.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        files: true,
        children: true,
        _count: {
          select: {
            files: true,
            children: true
          }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    res.json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Rename a folder
export const renameFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    // Verify folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: parseInt(id) },
      data: { name }
    });

    res.json({
      success: true,
      message: 'Folder renamed successfully',
      folder: updatedFolder
    });
  } catch (error) {
    console.error('Error renaming folder:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a folder
export const deleteFolder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Verify folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        files: true,
        children: true
      }
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    // TODO: Delete files from Cloudinary before deleting folder
    // For now, just delete the folder and its relations

    await prisma.folder.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
