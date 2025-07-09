import { useState, useEffect, useCallback } from "react";
import { ERROR_MESSAGES } from "../utils/constants";

// Custom hook for API operations
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { immediate = true, onSuccess, onError, transform } = options;

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunction(...args);
        const result = response.data || response;
        const transformedData = transform ? transform(result) : result;

        setData(transformedData);
        onSuccess && onSuccess(transformedData);

        return transformedData;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        onError && onError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, transform]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

// Hook for CRUD operations
export const useCrud = (service, resourceName) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all items
  const getAll = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await service.getAll(params);
        const result = response.data || response;
        setItems(result);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  // Get single item
  const getOne = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);
        const response = await service.getById(id);
        const result = response.data || response;
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  // Create item
  const create = useCallback(
    async (data) => {
      try {
        setLoading(true);
        setError(null);
        const response = await service.create(data);
        const result = response.data || response;
        setItems((prev) => [...prev, result]);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  // Update item
  const update = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);
        const response = await service.update(id, data);
        const result = response.data || response;
        setItems((prev) =>
          prev.map((item) => (item.id === id ? result : item))
        );
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  // Delete item
  const remove = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);
        await service.delete(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        return true;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  // Search items
  const search = useCallback(
    async (query, params = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await service.search(query, params);
        const result = response.data || response;
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  return {
    items,
    loading,
    error,
    getAll,
    getOne,
    create,
    update,
    remove,
    search,
    setItems,
    setError,
  };
};

// Hook for paginated data
export const usePagination = (service, initialPage = 1, initialLimit = 10) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(
    async (page = pagination.page, limit = pagination.limit, params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await service.getPaginated(page, limit, params);
        const result = response.data || response;

        setData(result.data || result.items || result);
        setPagination({
          page: result.page || page,
          limit: result.limit || limit,
          total: result.total || 0,
          totalPages:
            result.totalPages || Math.ceil((result.total || 0) / limit),
        });

        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service, pagination.page, pagination.limit]
  );

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchPage(pagination.page + 1);
    }
  }, [fetchPage, pagination.page, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      fetchPage(pagination.page - 1);
    }
  }, [fetchPage, pagination.page]);

  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        fetchPage(page);
      }
    },
    [fetchPage, pagination.totalPages]
  );

  const changeLimit = useCallback(
    (newLimit) => {
      fetchPage(1, newLimit);
    },
    [fetchPage]
  );

  return {
    data,
    pagination,
    loading,
    error,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refresh: () => fetchPage(),
  };
};

// Hook for form handling with API
export const useApiForm = (apiFunction, options = {}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { onSuccess, onError, resetOnSuccess = true } = options;

  const submit = useCallback(
    async (formData) => {
      try {
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        const result = await apiFunction(formData);

        setSuccess(true);
        onSuccess && onSuccess(result);

        if (resetOnSuccess) {
          setTimeout(() => setSuccess(false), 3000);
        }

        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        onError && onError(err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [apiFunction, onSuccess, onError, resetOnSuccess]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setSubmitting(false);
  }, []);

  return {
    submit,
    submitting,
    error,
    success,
    reset,
  };
};

// Utility function to extract error messages
const getErrorMessage = (error) => {
  if (error.isNetworkError) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error.status) {
    switch (error.status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 429:
        return ERROR_MESSAGES.RATE_LIMIT_ERROR;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.message || ERROR_MESSAGES.GENERIC_ERROR;
    }
  }

  return error.message || ERROR_MESSAGES.GENERIC_ERROR;
};
