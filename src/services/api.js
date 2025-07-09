import axios from "axios";

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
const API_KEY = process.env.REACT_APP_API_KEY || "demo-key-123";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
});

// Request interceptor - Add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    const { response, request, message } = error;

    // Enhanced error logging
    console.error("❌ API Error:", {
      status: response?.status,
      statusText: response?.statusText,
      url: request?.responseURL || error.config?.url,
      data: response?.data,
      message,
    });

    // Handle specific error cases
    if (response) {
      // Server responded with error status
      const { status, data } = response;

      switch (status) {
        case 401:
          // Unauthorized - remove token and redirect to login
          localStorage.removeItem("authToken");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Forbidden - show permission error
          console.error("Access forbidden - insufficient permissions");
          break;

        case 404:
          // Not found
          console.error("Resource not found");
          break;

        case 422:
          // Validation error
          console.error("Validation error:", data?.errors || data?.message);
          break;

        case 429:
          // Rate limit exceeded
          console.error("Rate limit exceeded - please try again later");
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error("Server error - please try again later");
          break;

        default:
          console.error("Unexpected error occurred");
      }

      // Enhance error object with custom properties
      error.statusCode = status;
      error.errorData = data;
    } else if (request) {
      // Network error or timeout
      console.error("Network error - check your connection");
      error.isNetworkError = true;
    } else {
      // Request setup error
      console.error("Request configuration error:", message);
    }

    return Promise.reject(error);
  }
);

// Auth helper methods
export const authHelpers = {
  setToken: (token) => {
    if (token) {
      localStorage.setItem("authToken", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("authToken");
      delete apiClient.defaults.headers.common["Authorization"];
    }
  },

  clearToken: () => {
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.common["Authorization"];
  },

  getToken: () => localStorage.getItem("authToken"),

  isAuthenticated: () => !!localStorage.getItem("authToken"),
};

// Health check utility
export const healthCheck = () => apiClient.get("/api/health");

export default apiClient;
