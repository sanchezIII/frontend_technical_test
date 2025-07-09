// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001";
export const API_KEY = process.env.REACT_APP_API_KEY || "demo-key-123";
export const API_TIMEOUT = 10000; // 10 seconds

// App Configuration
export const APP_NAME = "My App";
export const APP_VERSION = "1.0.0";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date Formats
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATETIME_FORMAT = "DD/MM/YYYY HH:mm";

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

export const SUBSCRIPTION_STATUS_LABELS = {
  [SUBSCRIPTION_STATUS.ACTIVE]: "Active",
  [SUBSCRIPTION_STATUS.PAUSED]: "Paused",
  [SUBSCRIPTION_STATUS.CANCELLED]: "Cancelled",
  [SUBSCRIPTION_STATUS.EXPIRED]: "Expired",
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  BASIC: "basic",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise",
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.BASIC]: "Basic",
  [PRODUCT_CATEGORIES.PREMIUM]: "Premium",
  [PRODUCT_CATEGORIES.ENTERPRISE]: "Enterprise",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// Error Types
export const ERROR_TYPES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Connection error. Please try again.",
  UNAUTHORIZED: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check the entered data.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  RATE_LIMIT_ERROR: "Too many requests. Please wait a moment.",
  TIMEOUT_ERROR: "Request took too long. Please try again.",
  FORBIDDEN: "Access denied. You don't have sufficient permissions.",
  GENERIC_ERROR: "An unexpected error occurred.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: "Record created successfully.",
  UPDATED: "Record updated successfully.",
  DELETED: "Record deleted successfully.",
  SAVED: "Changes saved successfully.",
};

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING: "Loading...",
  SAVING: "Saving...",
  DELETING: "Deleting...",
  PROCESSING: "Processing...",
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_PREFERENCES: "userPreferences",
  THEME: "theme",
};

// Routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  CUSTOMERS: "/customers",
  CUSTOMER_DETAIL: "/customers/:id",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  SUBSCRIPTIONS: "/subscriptions",
  SUBSCRIPTION_DETAIL: "/subscriptions/:id",
  LOGIN: "/login",
  PROFILE: "/profile",
};
