import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Round endpoints
  getCurrentRound: () => apiClient.get('/rounds/current'),
  getRoundById: (roundId: string) => apiClient.get(`/rounds/${roundId}`),
  getRoundResult: (roundId: string) => apiClient.get(`/rounds/${roundId}/result`),

  // Bet endpoints
  placeBet: (data: {
    operatorId: string;
    playerId: string;
    currency: string;
    stake: number;
    selections: number[];
  }) => apiClient.post('/bets', data),
  getBetById: (betId: string) => apiClient.get(`/bets/${betId}`),
  rollbackBet: (betId: string, reason?: string) =>
    apiClient.post('/bets/rollback', { betId, reason }),

  // Fairness endpoints
  verifyFairness: (serverSeed: string, clientSeed: string, nonce: number) =>
    apiClient.get('/fairness/verify', {
      params: { serverSeed, clientSeed, nonce },
    }),
};

export default apiService;
