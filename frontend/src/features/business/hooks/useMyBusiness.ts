import { useQuery } from '@tanstack/react-query';
import { getMyBusinessRequest } from '../api/businessApi';

export function useMyBusiness() {
  return useQuery({
    queryKey: ['business', 'me'],
    queryFn: getMyBusinessRequest,
  });
}