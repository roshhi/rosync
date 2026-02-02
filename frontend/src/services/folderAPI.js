import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const folderAPI = {
  // Create a new folder
  createFolder: async (name, parentId = null) => {
    try {
      const response = await axios.post(
        `${API_URL}/folders`,
        { name, parentId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to create folder'
      );
    }
  },

  // Get all folders
  getFolders: async (parentId = null) => {
    try {
      const params = parentId ? { parentId } : {};
      const response = await axios.get(
        `${API_URL}/folders`,
        {
          params,
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch folders'
      );
    }
  },

  // Get a specific folder
  getFolder: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/folders/${id}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch folder'
      );
    }
  },

  // Rename a folder
  renameFolder: async (id, name) => {
    try {
      const response = await axios.put(
        `${API_URL}/folders/${id}`,
        { name },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to rename folder'
      );
    }
  },

  // Delete a folder
  deleteFolder: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/folders/${id}`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Failed to delete folder'
      );
    }
  },
};
