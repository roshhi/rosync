import { prisma } from '../lib/prisma.js';

// Create a share link for a folder
export const createShareLink = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { duration } = req.body; // duration in days (e.g., "1d", "7d", "30d")

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

    // Parse duration and calculate expiration
    const durationMatch = duration.match(/^(\d+)d$/);
    if (!durationMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid duration format. Use format like "1d", "7d", "30d"'
      });
    }

    const days = parseInt(durationMatch[1]);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        folderId: parseInt(id),
        expiresAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'Share link created successfully',
      shareLink: {
        id: shareLink.id,
        url: `${process.env.FRONTEND_URL || 'http://localhost:5177'}/share/${shareLink.id}`,
        expiresAt: shareLink.expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get shared folder contents (public access)
export const getSharedFolder = async (req, res) => {
  try {
    const { shareId } = req.params;

    // Find share link
    const shareLink = await prisma.shareLink.findUnique({
      where: { id: shareId },
      include: {
        folder: {
          include: {
            files: {
              orderBy: {
                createdAt: 'desc'
              }
            },
            children: {
              orderBy: {
                name: 'asc'
              }
            }
          }
        }
      }
    });

    if (!shareLink) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found'
      });
    }

    // Check if link has expired
    if (new Date() > new Date(shareLink.expiresAt)) {
      return res.status(410).json({
        success: false,
        error: 'Share link has expired'
      });
    }

    res.json({
      success: true,
      folder: shareLink.folder,
      expiresAt: shareLink.expiresAt
    });
  } catch (error) {
    console.error('Error fetching shared folder:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};