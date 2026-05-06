import axios from 'axios';
import { GATEWAY_URL } from '../config/api';

const axiosInstance = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize errors with TraceID
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        traceId: null,
        code: 'NETWORK_ERROR',
      });
    }

    const { status, data, headers } = error.response;
    const traceId = headers?.['x-trace-id'] || data?.traceId || null;
    const message = data?.message || getDefaultMessage(status);
    const code = data?.code || status;

    if (status === 401) {
      // Token expired or invalid — clear session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject({ message, traceId, code, status });
  }
);

function getDefaultMessage(status) {
  const messages = {
    400: 'Yêu cầu không hợp lệ.',
    401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    403: 'Bạn không có quyền thực hiện thao tác này.',
    404: 'Không tìm thấy tài nguyên yêu cầu.',
    409: 'Xung đột dữ liệu. Vui lòng thử lại.',
    422: 'Dữ liệu không hợp lệ.',
    500: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
    503: 'Dịch vụ tạm thời không khả dụng.',
  };
  return messages[status] || `Đã xảy ra lỗi (${status}).`;
}

export default axiosInstance;
