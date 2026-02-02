import axios from 'axios';

const API_URL = 'https://rosync.onrender.com/api';

export const shareAPI = {
  // Create a share link for a folder
  createShareLink: async (folderId, duration) => {
    try {
      const response = await axios.post(
        `${API_URL}/share/folder/${folderId}`,
        { duration },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to create share link'
      );
    }
  },

  // Get shared folder contents (public - no auth)
  getSharedFolder: async (shareId) => {
    try {
      const response = await axios.get(
        `${API_URL}/share/${shareId}`
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch shared folder'
      );
    }
  },
};
