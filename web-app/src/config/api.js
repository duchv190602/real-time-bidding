// All API calls go through the API Gateway at port 8088
export const GATEWAY_URL = 'http://localhost:8088';
export const API_PREFIX = '/api/v1';

export const API_ROUTES = {
  // Identity Service
  AUTH_TOKEN: `${API_PREFIX}/identity/auth/token`,
  AUTH_LOGOUT: `${API_PREFIX}/identity/auth/logout`,
  USER_REGISTER: `${API_PREFIX}/identity/users/registration`,
  USER_ME: `${API_PREFIX}/identity/users/me`,

  // Auction Service
  AUCTIONS: `${API_PREFIX}/auction`,
  AUCTIONS_ADMIN: `${API_PREFIX}/auction/admin`,
  AUCTION_BY_ID: (id) => `${API_PREFIX}/auction/${id}`,
  AUCTION_APPROVE: (id) => `${API_PREFIX}/auction/${id}/approve`,
  AUCTION_START: (id) => `${API_PREFIX}/auction/${id}/start`,
  AUCTION_CANCEL: (id) => `${API_PREFIX}/auction/${id}/cancel`,
  AUCTION_IMAGE: (id) => `${API_PREFIX}/auction/${id}/images`,

  // Bidding Service
  PLACE_BID: `${API_PREFIX}/bidding/place-bid`,
};

export const IMAGES_BASE_URL = `http://localhost:8081`;
