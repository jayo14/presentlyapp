import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi, type CurrentPlan } from '../services/api/billing';
import { authApi } from '../services/api/auth';
import { queryKeys } from '../services/api/queryClient';

export function useCurrentPlan() {
  return useQuery<CurrentPlan | null>({
    queryKey: [...queryKeys.currentUser, 'billing', 'plan'],
    queryFn: () =>
      authApi.isAuthenticated() ? billingApi.getCurrentPlan() : Promise.resolve(null),
    enabled: authApi.isAuthenticated(),
    staleTime: 60_000,
    refetchInterval: (query) =>
      query.state.data?.status === 'PENDING' ? 3_000 : false,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planCode: string) => billingApi.checkout(planCode),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.currentUser, 'billing'],
      });
    },
  });
}

export function useCanCreateCourse() {
  const { data: plan } = useCurrentPlan();

  if (!plan || !plan.is_active) return { allowed: true, reason: null };

  const limit = plan.course_limit;

  if (limit === null) return { allowed: true, reason: null };

  return {
    allowed: false,
    reason: `You've reached the ${limit}-course limit. Upgrade to create more.`,
  };
}
