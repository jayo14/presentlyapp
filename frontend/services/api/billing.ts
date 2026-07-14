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

  // ─── Admin endpoints ────────────────────────────────────

  adminListPlans: () =>
    apiClient.get('/billing/admin/plans/').then((r) => r.data),

  adminCreatePlan: (data: Record<string, unknown>) =>
    apiClient.post('/billing/admin/plans/', data).then((r) => r.data),

  adminUpdatePlan: (planId: number, data: Record<string, unknown>) =>
    apiClient.put(`/billing/admin/plans/${planId}/`, data).then((r) => r.data),

  adminDeactivatePlan: (planId: number) =>
    apiClient.delete(`/billing/admin/plans/${planId}/`).then((r) => r.data),

  adminListSubscriptions: (params?: Record<string, string>) =>
    apiClient.get('/billing/admin/subscriptions/', { params }).then((r) => r.data),

  adminOverrideSubscription: (subId: number, status: string) =>
    apiClient.put(`/billing/admin/subscriptions/${subId}/override/`, { status }).then((r) => r.data),

  adminListPayments: (params?: Record<string, string>) =>
    apiClient.get('/billing/admin/payments/', { params }).then((r) => r.data),

  adminListSeats: (params?: Record<string, string>) =>
    apiClient.get('/billing/admin/seats/', { params }).then((r) => r.data),

  adminListCredits: () =>
    apiClient.get('/billing/admin/credits/').then((r) => r.data),

  adminGetStats: () =>
    apiClient.get('/billing/admin/stats/').then((r) => r.data),
};
