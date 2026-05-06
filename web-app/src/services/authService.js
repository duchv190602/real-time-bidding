import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../config/api';

export const authService = {
  /**
   * Đăng nhập → POST /api/v1/identity/auth/token
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<{ token: string, expiryTime: string }>}
   */
  login: async (credentials) => {
    const response = await axiosInstance.post(API_ROUTES.AUTH_TOKEN, credentials);
    return response.data.result;
  },

  /**
   * Đăng ký → POST /api/v1/identity/users/registration
   */
  register: async (userData) => {
    const response = await axiosInstance.post(API_ROUTES.USER_REGISTER, userData);
    return response.data.result;
  },

  /**
   * Đăng xuất → POST /api/v1/identity/auth/logout
   */
  logout: async (token) => {
    await axiosInstance.post(API_ROUTES.AUTH_LOGOUT, { token });
  },
};
