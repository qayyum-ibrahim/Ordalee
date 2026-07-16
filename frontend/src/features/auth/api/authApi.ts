import { apiClient } from '@/lib/services/apiClient';

interface AccessTokenResponse {
  data: { accessToken: string };
}

export interface CurrentUser {
  userId: string;
  email: string;
  emailVerified: boolean;
}

export async function getCurrentUserRequest(): Promise<CurrentUser> {
  const { data } = await apiClient.get<{ data: CurrentUser }>('/auth/me');
  return data.data;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await apiClient.post<AccessTokenResponse>('/auth/login', { email, password });
  return data.data;
}

export async function registerRequest(email: string, password: string) {
  const { data } = await apiClient.post('/auth/register', { email, password });
  return data.data;
}

export async function refreshRequest() {
  const { data } = await apiClient.post<AccessTokenResponse>('/auth/refresh');
  return data.data;
}

export async function logoutRequest() {
  await apiClient.post('/auth/logout');
}