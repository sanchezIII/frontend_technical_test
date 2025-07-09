import apiClient from "./api";

export const productService = {
  // GET /api/products - List with filters and pagination
  getAll: (params = {}) => {
    return apiClient.get("/api/products", { params });
  },

  // GET /api/products/{id} - Get product by ID
  getById: (id) => {
    return apiClient.get(`/api/products/${id}`);
  },

  // POST /api/products - Create new product
  create: (data) => {
    return apiClient.post("/api/products", data);
  },

  // PUT /api/products/{id} - Update product
  update: (id, data) => {
    return apiClient.put(`/api/products/${id}`, data);
  },

  // DELETE /api/products/{id} - Delete product
  delete: (id) => {
    return apiClient.delete(`/api/products/${id}`);
  },

  // POST /api/products/{id}/activate - Activate product
  activate: (id) => {
    return apiClient.post(`/api/products/${id}/activate`);
  },

  // POST /api/products/{id}/deactivate - Deactivate product
  deactivate: (id) => {
    return apiClient.post(`/api/products/${id}/deactivate`);
  },
};
