import apiClient from "./api";

export const analyticsService = {
  getFinancialMetrics: (periodMonths = 12) =>
    apiClient.get(
      `/api/analytics/financial-metrics?period_months=${periodMonths}`
    ),
  getSubscriptionStats: () => apiClient.get("/api/subscriptions/stats"),
};
