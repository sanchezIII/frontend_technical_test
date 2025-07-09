import apiClient from "./api";

export const customerService = {
  // Basic CRUD operations
  getAll: (params = {}) => apiClient.get("/api/customers", { params }),
  getById: (id) => apiClient.get(`/api/customers/${id}`),
  create: (data) => apiClient.post("/api/customers", data),
  update: (id, data) => apiClient.put(`/api/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/api/customers/${id}`),

  // Search and filtering
  search: (query) =>
    apiClient.get(`/api/customers/search`, { params: { q: query } }),

  // Pagination
  getPaginated: (page = 1, limit = 10, filters = {}) =>
    apiClient.get("/api/customers", {
      params: { page, limit, ...filters },
    }),

  // Customer-specific operations
  getStats: (id) => apiClient.get(`/api/customers/${id}/stats`),
  getSubscriptions: (id) => apiClient.get(`/api/customers/${id}/subscriptions`),

  // Bulk operations
  bulkCreate: (customers) =>
    apiClient.post("/api/customers/bulk", { customers }),
  bulkUpdate: (updates) => apiClient.put("/api/customers/bulk", { updates }),
  bulkDelete: (ids) =>
    apiClient.delete("/api/customers/bulk", { data: { ids } }),

  // Export/Import
  exportData: (format = "csv") =>
    apiClient.get(`/api/customers/export`, {
      params: { format },
      responseType: "blob",
    }),
  importData: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/api/customers/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
