import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchMyProfile } from '../api/profile';
import { profileQueryKeys } from '../types';

export function useMyProfile() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: profileQueryKeys.my(userId ?? ''),
    queryFn: () => fetchMyProfile(userId!),
    enabled: !!userId,
    staleTime: 10 * 60_000,
  });
}
