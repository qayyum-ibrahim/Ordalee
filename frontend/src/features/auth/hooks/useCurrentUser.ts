import { useQuery } from '@tanstack/react-query';
import { getCurrentUserRequest } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUserRequest,
    enabled: !!accessToken,
  });
}