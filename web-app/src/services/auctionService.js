import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../config/api';

export const auctionService = {
  /**
   * Lấy danh sách đấu giá có phân trang + lọc trạng thái
   * GET /api/v1/auction?page=0&size=10&status=ACTIVE
   */
  getAuctions: async ({ page = 0, size = 9, status } = {}) => {
    const params = { page, size };
    if (status && status !== 'ALL') params.status = status;
    const response = await axiosInstance.get(API_ROUTES.AUCTIONS, { params });
    return response.data.result;
  },

  /**
   * Lấy danh sách đấu giá cho Admin (tất cả trạng thái)
   */
  getAuctionsForAdmin: async ({ page = 0, size = 10, status } = {}) => {
    const params = { page, size };
    if (status && status !== 'ALL') params.status = status;
    const response = await axiosInstance.get(API_ROUTES.AUCTIONS_ADMIN, { params });
    return response.data.result;
  },

  /**
   * Lấy chi tiết một phiên đấu giá theo ID
   * GET /api/v1/auction/:id
   */
  getAuctionById: async (id) => {
    const response = await axiosInstance.get(API_ROUTES.AUCTION_BY_ID(id));
    return response.data.result;
  },

  /** POST /auction/create — multipart/form-data */
  createAuction: async (formData) => {
    const response = await axiosInstance.post(
      `${API_ROUTES.AUCTIONS}/create`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.result;
  },

  /** PUT /auction/:id — update DRAFT product */
  updateAuction: async (id, data) => {
    const response = await axiosInstance.put(API_ROUTES.AUCTION_BY_ID(id), data);
    return response.data.result;
  },

  /** PUT /auction/:id/approve */
  approveAuction: async (id) => {
    const response = await axiosInstance.put(API_ROUTES.AUCTION_APPROVE(id));
    return response.data.result;
  },

  /** PUT /auction/:id/start */
  startAuction: async (id) => {
    const response = await axiosInstance.put(API_ROUTES.AUCTION_START(id));
    return response.data.result;
  },

  /** PUT /auction/:id/cancel */
  cancelAuction: async (id) => {
    const response = await axiosInstance.put(API_ROUTES.AUCTION_CANCEL(id));
    return response.data.result;
  },
};
