import { apiClient } from '@/lib/services/apiClient';

export type PaymentMethod = 'cash' | 'transfer' | 'pos' | 'other';
export type DiscountType = 'flat' | 'percentage';

export interface ReceiptItemInput {
  name: string;
  quantity: number;
  unitPriceMinor: number;
}

export interface Receipt {
  _id: string;
  businessId: string;
  clientReceiptId: string;
  receiptNumber: string;
  customerName?: string;
  items: (ReceiptItemInput & { subtotalMinor: number })[];
  subtotalMinor: number;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmountMinor: number;
  taxPercentage: number;
  taxAmountMinor: number;
  totalMinor: number;
  notes?: string;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'void';
  voidedAt?: string;
  clientCreatedAt: string;
  createdAt: string;
}

export interface CreateReceiptInput {
  clientReceiptId: string;
  customerName?: string;
  items: ReceiptItemInput[];
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
  paymentMethod: PaymentMethod;
  clientCreatedAt: string;
}

export async function createReceiptRequest(businessId: string, input: CreateReceiptInput): Promise<Receipt> {
  const { data } = await apiClient.post<{ data: Receipt }>(`/businesses/${businessId}/receipts`, input);
  return data.data;
}

export async function getReceiptRequest(businessId: string, receiptId: string): Promise<Receipt> {
  const { data } = await apiClient.get<{ data: Receipt }>(`/businesses/${businessId}/receipts/${receiptId}`);
  return data.data;
}

export async function getReceiptByClientIdRequest(businessId: string, clientReceiptId: string): Promise<Receipt> {
  const { data } = await apiClient.get<{ data: Receipt }>(`/businesses/${businessId}/receipts/by-client-id/${clientReceiptId}`);
  return data.data;
}

export interface ListReceiptsParams {
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListReceiptsResponse {
  receipts: Receipt[];
  total: number;
  page: number;
  limit: number;
}

export async function listReceiptsRequest(businessId: string, params: ListReceiptsParams): Promise<ListReceiptsResponse> {
  const { data } = await apiClient.get<{ data: ListReceiptsResponse }>(`/businesses/${businessId}/receipts`, { params });
  return data.data;
}

export async function voidReceiptRequest(businessId: string, receiptId: string): Promise<Receipt> {
  const { data } = await apiClient.patch<{ data: Receipt }>(`/businesses/${businessId}/receipts/${receiptId}/void`);
  return data.data;
}
export async function restoreReceiptRequest(businessId: string, receiptId: string): Promise<Receipt> {
  const { data } = await apiClient.patch<{ data: Receipt }>(`/businesses/${businessId}/receipts/${receiptId}/restore`);
  return data.data;
}