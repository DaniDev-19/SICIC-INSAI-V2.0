import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { useDebounce } from '@/hooks/use-debounce';

export function useLoginInstances(email: string) {
  const debouncedEmail = useDebounce(email.trim(), 400);
  const isValidEmail = z.string().email().safeParse(debouncedEmail).success;

  return useQuery({
    queryKey: ['login-instances', debouncedEmail],
    queryFn: () => authService.getInstances(debouncedEmail),
    enabled: isValidEmail,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
  });
}
