import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../config/api';

export const biddingService = {
  /**
   * Đặt giá thầu → POST /api/v1/bidding/place-bid
   * @param {{ auctionId: string, price: number }} bidData
   */
  placeBid: async (bidData) => {
    const response = await axiosInstance.post(API_ROUTES.PLACE_BID, bidData);
    return response.data;
  },
};
