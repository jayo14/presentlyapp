import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';

export interface CurrentPlan {
  billing_owner: Record<string, unknown> | null;
  plan: {
    code: string;
    name: string;
    price_kobo: number;
    interval: string;
    course_limit: number | null;
    seat_limit: number | null;
    features: Record<string, boolean>;
  } | null;
  status: string | null;
  course_limit: number | null;
  seat_limit: number | null;
  is_active: boolean;
}

export interface CheckoutResponse {
  authorization_url: string;
  reference: string;
}

export const billingService = {
  getCurrentPlan: () =>
    apiClient.get<CurrentPlan>(API_ENDPOINTS.BILLING.ME).then((r) => r.data),

  checkout: (planCode: string) =>
    apiClient
      .post<CheckoutResponse>(API_ENDPOINTS.BILLING.CHECKOUT, { plan_code: planCode })
      .then((r) => r.data),
};
