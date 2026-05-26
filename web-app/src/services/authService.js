import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../config/api';

const GOOGLE_CLIENT_ID = '20916761531-o7s95o7qn75nql1t74ag5ct90bvj14ge.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = 'http://localhost:3000/authenticate';

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
   * Đăng nhập bằng Google — gửi authorization code lên Identity Service
   * @param {string} code — authorization code từ Google redirect
   * @returns {Promise<{ token: string }>}
   */
  loginWithGoogle: async (code) => {
    const response = await axiosInstance.post(API_ROUTES.AUTH_GOOGLE, { code });
    return response.data.result;
  },

  /**
   * Tạo Google OAuth2 Authorization URL để redirect user sang Google
   */
  getGoogleAuthUrl: () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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

