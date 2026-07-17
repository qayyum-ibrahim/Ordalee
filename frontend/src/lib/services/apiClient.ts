import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie automatically
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const newToken = response.data.data.accessToken as string;
  useAuthStore.getState().setAccessToken(newToken);
  return newToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // If several requests fail at once, they share one refresh call
        // instead of each independently hitting /auth/refresh.
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);