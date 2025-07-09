// Services index - Central export for all API services
import apiClient, { authHelpers, healthCheck } from "./api";
import { customerService } from "./customerService";
import { productService } from "./productService";
import { subscriptionService } from "./subscriptionService";
import { analyticsService } from "./analyticsService";

// Re-export individual services
export { apiClient, authHelpers, healthCheck };
export { customerService } from "./customerService";
export { productService } from "./productService";
export { subscriptionService } from "./subscriptionService";
export { analyticsService } from "./analyticsService";

// Service collections for easy import
export const services = {
  customer: customerService,
  product: productService,
  subscription: subscriptionService,
  analytics: analyticsService,
};

// Authentication utilities
export const auth = authHelpers;

// API health check
export const checkApiHealth = healthCheck;
