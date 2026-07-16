import { apiClient } from '@/lib/services/apiClient';
import { Receipt } from '@/features/receipts/api/receiptsApi';

export interface DashboardStats {
  todayRevenueMinor: number;
  weekRevenueMinor: number;
  monthRevenueMinor: number;
  todayReceiptCount: number;
  recentReceipts: Receipt[];
}

export async function getDashboardStatsRequest(businessId: string): Promise<DashboardStats> {
  const { data } = await apiClient.get<{ data: DashboardStats }>(`/businesses/${businessId}/dashboard`);
  return data.data;
}