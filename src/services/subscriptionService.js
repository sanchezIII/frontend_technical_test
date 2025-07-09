import apiClient from "./api";

export const subscriptionService = {
  // GET /api/subscriptions - List with filters and pagination
  getAll: (params = {}) => {
    return apiClient.get("/api/subscriptions", { params });
  },

  // GET /api/subscriptions/{id} - Get subscription by ID
  getById: (id) => {
    return apiClient.get(`/api/subscriptions/${id}`);
  },

  // POST /api/subscribe - Advanced endpoint with automatic inheritance (RECOMMENDED)
  subscribe: (data) => {
    return apiClient.post("/api/subscribe", data);
  },

  // POST /api/subscriptions - Basic endpoint
  create: (data) => {
    return apiClient.post("/api/subscriptions", data);
  },

  // PUT /api/subscriptions/{id} - Update subscription
  update: (id, data) => {
    return apiClient.put(`/api/subscriptions/${id}`, data);
  },

  // DELETE /api/subscriptions/{id} - Delete subscription
  delete: (id) => {
    return apiClient.delete(`/api/subscriptions/${id}`);
  },

  // GET /api/subscriptions/{id}/settings - Get subscription settings
  getSettings: (id) => {
    return apiClient.get(`/api/subscriptions/${id}/settings`);
  },

  // PUT /api/subscriptions/{id}/settings - Update subscription settings
  updateSettings: (id, customSettings) => {
    return apiClient.put(`/api/subscriptions/${id}/settings`, {
      custom_settings: customSettings,
    });
  },

  // POST /api/subscriptions/{id}/apply-defaults - Apply product defaults
  applyDefaults: (id) => {
    return apiClient.post(`/api/subscriptions/${id}/apply-defaults`);
  },

  // GET /api/subscriptions/{id}/status - Get subscription status
  getStatus: (id) => {
    return apiClient.get(`/api/subscriptions/${id}/status`);
  },

  // POST /api/subscriptions/{id}/extend - Extend subscription
  extend: (id, data) => {
    return apiClient.post(`/api/subscriptions/${id}/extend`, data);
  },

  // POST /api/subscriptions/{id}/cancel - Cancel subscription
  cancel: (id) => {
    return apiClient.post(`/api/subscriptions/${id}/cancel`);
  },

  // POST /api/subscriptions/{id}/renew - Renew subscription
  renew: (id) => {
    return apiClient.post(`/api/subscriptions/${id}/renew`);
  },
};
