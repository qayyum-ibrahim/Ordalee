import { apiClient } from '@/lib/services/apiClient';

export interface Business {
  _id: string;
  ownerId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  currency: string;
  receiptPrefix: string;
  taxPercentage: number;
  receiptSequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  currency?: string;
  receiptPrefix?: string;
  taxPercentage?: number;
  logoUrl?: string;
}

export async function getMyBusinessRequest(): Promise<Business | null> {
  try {
    const { data } = await apiClient.get<{ data: Business }>('/businesses/me');
    return data.data;
  } catch (error) {
    // A 404 here means "this account hasn't created a business yet" — a
    // normal state, not a failure. Anything else should still propagate.
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function createBusinessRequest(input: BusinessInput): Promise<Business> {
  const { data } = await apiClient.post<{ data: Business }>('/businesses', input);
  return data.data;
}

export async function updateBusinessRequest(businessId: string, input: Partial<BusinessInput>): Promise<Business> {
  const { data } = await apiClient.patch<{ data: Business }>(`/businesses/${businessId}`, input);
  return data.data;
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}