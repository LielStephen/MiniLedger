import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LoanSummary } from '../components/SummaryCard';
import { LoanItem } from '../components/LoanCard';

// Detect local development host:
// - Android Emulator: 10.0.2.2
// - iOS Simulator / Web: localhost
// - Can be overridden via EXPO_PUBLIC_API_URL in .env
const getDefaultBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }
  return 'http://localhost:4000';
};

export const API_BASE_URL = getDefaultBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'miniledger_jwt_token';

// In-memory token cache for high-speed synchronous requests
let cachedToken: string | null = null;

export async function setAuthToken(token: string | null): Promise<void> {
  cachedToken = token;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getStoredToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    return cachedToken;
  } catch (error) {
    console.warn('[SecureStore] Failed to retrieve token:', error);
    return null;
  }
}

// Request interceptor to attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Helper Methods
export const apiService = {
  // 1. Request OTP
  async requestOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/request-otp', { phone });
    return response.data;
  },

  // 2. Verify OTP
  async verifyOtp(
    phone: string,
    otp: string
  ): Promise<{ token: string; user: { id: string; phone: string } }> {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    return response.data;
  },

  // 3. Get Summary Metrics
  async getSummary(): Promise<LoanSummary> {
    const response = await api.get('/loans/summary');
    return response.data;
  },

  // 4. Get Loans List
  async getLoans(): Promise<LoanItem[]> {
    const response = await api.get('/loans');
    return response.data;
  },

  // 5. Create Loan Entry (supports optional receipt image upload via multipart/form-data)
  async createLoan(data: {
    friendName: string;
    amount: number;
    dueDate: string;
    receiptUri?: string;
  }): Promise<LoanItem> {
    if (data.receiptUri) {
      const formData = new FormData();
      formData.append('friendName', data.friendName);
      formData.append('amount', data.amount.toString());
      formData.append('dueDate', data.dueDate);

      const filename = data.receiptUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('receipt', {
        uri: data.receiptUri,
        name: filename,
        type,
      } as any);

      const response = await api.post('/loans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    const response = await api.post('/loans', {
      friendName: data.friendName,
      amount: data.amount,
      dueDate: data.dueDate,
    });
    return response.data;
  },

  // 6. Mark Loan as Repaid
  async repayLoan(id: string): Promise<LoanItem> {
    const response = await api.patch(`/loans/${id}/repay`);
    return response.data;
  },
};
