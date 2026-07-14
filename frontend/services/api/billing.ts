import apiClient from './client';

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

export const billingApi = {
  getCurrentPlan: () =>
    apiClient.get<CurrentPlan>('/billing/me/').then((r) => r.data),

  checkout: (planCode: string) =>
    apiClient
      .post<CheckoutResponse>('/billing/checkout/', { plan_code: planCode })
      .then((r) => r.data),
};
