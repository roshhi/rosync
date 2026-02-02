import axios from 'axios';

const API_URL = 'https://rosync.onrender.com/api';

export const fileAPI = {
  // Upload a file
  uploadFile: async (file, folderId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) {
        formData.append('folderId', folderId);
      }

      const response = await axios.post(
        `${API_URL}/files/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to upload file'
      );
    }
  },

  // Get all files
  getFiles: async (folderId = null) => {
    try {
      const params = folderId ? { folderId } : {};
      const response = await axios.get(
        `${API_URL}/files`,
        {
          params,
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch files'
      );
    }
  },

  // Get specific file by ID
  getFileById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/files/${id}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch file details'
      );
    }
  },

  // Delete a file
  deleteFile: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/files/${id}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to delete file'
      );
    }
  },

  // Get storage statistics
  getStorageStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/storage/stats`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch storage stats'
      );
    }
  },
};
