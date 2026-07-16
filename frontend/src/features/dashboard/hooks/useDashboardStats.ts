import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsRequest } from '../api/dashboardApi';

export function useDashboardStats(businessId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', businessId],
    queryFn: () => getDashboardStatsRequest(businessId!),
    enabled: !!businessId,
  });
}