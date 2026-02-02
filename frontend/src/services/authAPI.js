import axios from 'axios';

const API_URL = 'https://rosync.onrender.com/auth';

export const authAPI = {
  signup: async (userData) => {
    try {
      const response = await axios.post(
        `${API_URL}/signup`,
        userData,
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
        error.response?.data?.error || 'Signup failed'
      );
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        credentials,
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
        error.response?.data?.error || 'Login failed'
      );
    }
  },

  getMe: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/me`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Authentication failed'
      );
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 'Logout failed'
      );
    }
  },
};
